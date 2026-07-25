import { ANALYTICS_EVENT_NAMES, type AnalyticsEventKey } from "@/lib/analytics/events";

export type DashboardEventKey = AnalyticsEventKey;

export type PostHogDashboardCounts = Record<
  DashboardEventKey,
  { last7Days: number; last30Days: number }
>;

export type PostHogDashboardResult =
  | { status: "ok"; counts: PostHogDashboardCounts }
  | {
      status: "unavailable";
      reason: "missing_env" | "request_failed" | "invalid_response";
      message: string;
    };

const dashboardEventConfig = Object.entries(ANALYTICS_EVENT_NAMES) as [
  DashboardEventKey,
  string,
][];

// Historical aliases preserve already-collected data while all new captures
// use ANALYTICS_EVENT_NAMES above.
const eventAliases: Partial<Record<DashboardEventKey, readonly string[]>> = {
  scheduleStarted: ["schedule_clicked"],
  qaCompleted: ["qa_finished"],
  continueSelected: ["continue_after_qa", "qa_continue_clicked"],
  passSelected: ["pass_after_qa", "qa_pass_privately_clicked"],
  datePlanCreated: ["date_plan_shared"],
};

const eventNameToKey = new Map<string, DashboardEventKey>(
  dashboardEventConfig.flatMap(([key, eventName]) => [
    [eventName, key] as const,
    ...(eventAliases[key] ?? []).map((alias) => [alias, key] as const),
  ]),
);

const posthogEventNames = Array.from(eventNameToKey.keys());

function emptyCounts(): PostHogDashboardCounts {
  return Object.fromEntries(
    dashboardEventConfig.map(([key]) => [
      key,
      { last7Days: 0, last30Days: 0 },
    ]),
  ) as PostHogDashboardCounts;
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function isPostHogResultRow(value: unknown): value is [string, number, number] {
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    typeof value[0] === "string" &&
    typeof value[1] === "number" &&
    typeof value[2] === "number"
  );
}

export async function getPostHogDashboardCounts(): Promise<PostHogDashboardResult> {
  const apiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.POSTHOG_HOST;

  if (!apiKey || !projectId || !host) {
    return {
      status: "unavailable",
      reason: "missing_env",
      message:
        "PostHog is not connected. Add the server-only PostHog env vars to show live event counts.",
    };
  }

  const baseUrl = host.replace(/\/+$/, "");
  const url = `${baseUrl}/api/projects/${encodeURIComponent(projectId)}/query/`;
  const eventNames = posthogEventNames.map(sqlString);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: {
          kind: "HogQLQuery",
          query: `
            SELECT
              event,
              countIf(timestamp >= now() - INTERVAL 7 DAY) AS last_7_days,
              countIf(timestamp >= now() - INTERVAL 30 DAY) AS last_30_days
            FROM events
            WHERE event IN (${eventNames.join(", ")})
              AND timestamp >= now() - INTERVAL 30 DAY
            GROUP BY event
          `,
        },
        name: "intentionally-founder-analytics-v1",
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        status: "unavailable",
        reason: "request_failed",
        message:
          "PostHog event counts could not be fetched. Check the API key, project ID, host, or rate limits.",
      };
    }

    const payload: unknown = await response.json();
    const results =
      payload &&
      typeof payload === "object" &&
      "results" in payload &&
      Array.isArray(payload.results)
        ? payload.results
        : null;

    if (!results) {
      return {
        status: "unavailable",
        reason: "invalid_response",
        message:
          "PostHog returned an unexpected response shape, so live counts are unavailable.",
      };
    }

    const counts = emptyCounts();
    for (const row of results) {
      if (!isPostHogResultRow(row)) {
        return {
          status: "unavailable",
          reason: "invalid_response",
          message:
            "PostHog returned malformed event count rows, so live counts are unavailable.",
        };
      }

      const [eventName, last7Days, last30Days] = row;
      const key = eventNameToKey.get(eventName);
      if (!key) continue;

      counts[key] = {
        last7Days:
          counts[key].last7Days + Math.max(0, Math.round(last7Days)),
        last30Days:
          counts[key].last30Days + Math.max(0, Math.round(last30Days)),
      };
    }

    return { status: "ok", counts };
  } catch {
    return {
      status: "unavailable",
      reason: "request_failed",
      message:
        "PostHog event counts could not be fetched before the request timed out.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
