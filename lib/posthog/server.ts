import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics/events";

export type DashboardEventKey =
  | "loginClicked"
  | "onboardingStarted"
  | "onboardingCompleted"
  | "discoverViewed"
  | "profileLiked"
  | "profilePassed"
  | "matchCreated"
  | "scheduleClicked"
  | "qaStarted"
  | "visibilitySelected"
  | "qaQuestionAnswered"
  | "qaFinished"
  | "continueSelected"
  | "passPrivatelySelected"
  | "chatSent"
  | "datePlanViewed"
  | "datePlanShared";

export type PostHogDashboardCounts = Record<
  DashboardEventKey,
  {
    last7Days: number;
    last30Days: number;
  }
>;

export type PostHogDashboardResult =
  | {
      status: "ok";
      counts: PostHogDashboardCounts;
    }
  | {
      status: "unavailable";
      reason: "missing_env" | "request_failed" | "invalid_response";
      message: string;
    };

const dashboardEventConfig = [
  ["loginClicked", ANALYTICS_EVENT_NAMES.loginClicked],
  ["onboardingStarted", ANALYTICS_EVENT_NAMES.onboardingStarted],
  ["onboardingCompleted", ANALYTICS_EVENT_NAMES.onboardingCompleted],
  ["discoverViewed", ANALYTICS_EVENT_NAMES.discoverViewed],
  ["profileLiked", ANALYTICS_EVENT_NAMES.profileLiked],
  ["profilePassed", ANALYTICS_EVENT_NAMES.profilePassed],
  ["matchCreated", ANALYTICS_EVENT_NAMES.matchCreated],
  ["scheduleClicked", ANALYTICS_EVENT_NAMES.scheduleClicked],
  ["qaStarted", ANALYTICS_EVENT_NAMES.qaStarted],
  ["visibilitySelected", ANALYTICS_EVENT_NAMES.visibilitySelected],
  ["qaQuestionAnswered", ANALYTICS_EVENT_NAMES.qaQuestionAnswered],
  ["qaFinished", ANALYTICS_EVENT_NAMES.qaFinished],
  ["continueSelected", ANALYTICS_EVENT_NAMES.continueSelected],
  ["passPrivatelySelected", ANALYTICS_EVENT_NAMES.passPrivatelySelected],
  ["chatSent", ANALYTICS_EVENT_NAMES.chatSent],
  ["datePlanViewed", ANALYTICS_EVENT_NAMES.datePlanViewed],
  ["datePlanShared", ANALYTICS_EVENT_NAMES.datePlanShared],
] as const satisfies readonly [DashboardEventKey, string][];

const eventAliases: Partial<Record<DashboardEventKey, readonly string[]>> = {
  continueSelected: ["qa_continue_clicked"],
  passPrivatelySelected: ["qa_pass_privately_clicked"],
  chatSent: ["chat_message_sent"],
};

const eventNameToKey: ReadonlyMap<string, DashboardEventKey> = new Map(
  dashboardEventConfig.map(([key, eventName]) => [eventName, key]),
);

const posthogEventNames = Array.from(
  new Set([
    ...dashboardEventConfig.map(([, eventName]) => eventName),
    ...Object.values(eventAliases).flatMap((aliases) => aliases ?? []),
  ]),
);

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
  if (!Array.isArray(value) || value.length < 3) return false;

  const [eventName, last7Days, last30Days] = value;
  return (
    typeof eventName === "string" &&
    typeof last7Days === "number" &&
    typeof last30Days === "number"
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
  const eventNames = posthogEventNames.map((eventName) => sqlString(eventName));
  const normalizedEventCase = dashboardEventConfig
    .map(([key, eventName]) => {
      const aliases = eventAliases[key] ?? [];
      const values = [eventName, ...aliases].map(sqlString).join(", ");

      return aliases.length > 0
        ? `WHEN event IN (${values}) THEN ${sqlString(eventName)}`
        : "";
    })
    .filter(Boolean)
    .join("\n              ");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

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
            WITH normalized_events AS (
              SELECT
                CASE
                  ${normalizedEventCase}
                  ELSE event
                END AS event,
                timestamp
              FROM events
              WHERE event IN (${eventNames.join(", ")})
                AND timestamp >= now() - INTERVAL 30 DAY
            )
            SELECT
              event,
              countIf(timestamp >= now() - INTERVAL 7 DAY) AS last_7_days,
              countIf(timestamp >= now() - INTERVAL 30 DAY) AS last_30_days
            FROM normalized_events
            GROUP BY event
          `,
          },
        name: "intentionally-admin-analytics-counts",
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
        last7Days: Math.max(0, Math.round(last7Days)),
        last30Days: Math.max(0, Math.round(last30Days)),
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
