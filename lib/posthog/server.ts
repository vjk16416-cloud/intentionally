import { ANALYTICS_EVENT_NAMES } from "@/lib/analytics/events";

export type DashboardEventKey =
  | "loginClicked"
  | "onboardingStarted"
  | "onboardingCompleted"
  | "profileLiked"
  | "profilePassed"
  | "matchCreated"
  | "scheduleClicked"
  | "qaStarted"
  | "qaFinished"
  | "qaContinueClicked"
  | "qaPassPrivatelyClicked"
  | "chatMessageSent"
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
  ["profileLiked", ANALYTICS_EVENT_NAMES.profileLiked],
  ["profilePassed", ANALYTICS_EVENT_NAMES.profilePassed],
  ["matchCreated", ANALYTICS_EVENT_NAMES.matchCreated],
  ["scheduleClicked", ANALYTICS_EVENT_NAMES.scheduleClicked],
  ["qaStarted", ANALYTICS_EVENT_NAMES.qaStarted],
  ["qaFinished", ANALYTICS_EVENT_NAMES.qaFinished],
  ["qaContinueClicked", ANALYTICS_EVENT_NAMES.qaContinueClicked],
  ["qaPassPrivatelyClicked", ANALYTICS_EVENT_NAMES.qaPassPrivatelyClicked],
  ["chatMessageSent", ANALYTICS_EVENT_NAMES.chatMessageSent],
  ["datePlanShared", ANALYTICS_EVENT_NAMES.datePlanShared],
] as const satisfies readonly [DashboardEventKey, string][];

const eventNameToKey: ReadonlyMap<string, DashboardEventKey> = new Map(
  dashboardEventConfig.map(([key, eventName]) => [eventName, key]),
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
  const eventNames = dashboardEventConfig
    .map(([, eventName]) => sqlString(eventName))
    .join(", ");
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
            SELECT
              event,
              countIf(timestamp >= now() - INTERVAL 7 DAY) AS last_7_days,
              countIf(timestamp >= now() - INTERVAL 30 DAY) AS last_30_days
            FROM events
            WHERE event IN (${eventNames})
              AND timestamp >= now() - INTERVAL 30 DAY
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
