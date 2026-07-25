import "server-only";

import {
  ANALYTICS_EVENT_NAMES,
  sanitiseAnalyticsProperties,
  type AnalyticsEventKey,
} from "@/lib/analytics/events";

type ServerAnalyticsOptions = {
  distinctId: string;
  properties?: Record<string, unknown>;
};

/**
 * Records durable server-side outcomes without making analytics availability a
 * dependency of the user journey. No personal profile is created in PostHog.
 */
export async function trackServerAnalyticsEvent(
  eventKey: AnalyticsEventKey,
  { distinctId, properties }: ServerAnalyticsOptions,
) {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token || !distinctId) return;

  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com").replace(
    /\/+$/,
    "",
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_500);

  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: token,
        event: ANALYTICS_EVENT_NAMES[eventKey],
        properties: {
          distinct_id: distinctId,
          $process_person_profile: false,
          ...sanitiseAnalyticsProperties(properties),
        },
      }),
      cache: "no-store",
      signal: controller.signal,
    });
  } catch {
    // Product actions must remain available when analytics is unavailable.
  } finally {
    clearTimeout(timeout);
  }
}
