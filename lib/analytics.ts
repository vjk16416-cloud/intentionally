export const AnalyticsEvents = {
  LOGIN: "login",
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
  PROFILE_LIKED: "profile_liked",
  PROFILE_PASSED: "profile_passed",
  MATCH_CREATED: "match_created",
  SCHEDULE_CLICKED: "schedule_clicked",
  QA_STARTED: "qa_started",
  QA_FINISHED: "qa_finished",
  CONTINUE_AFTER_QA: "continue_after_qa",
  PASS_AFTER_QA: "pass_after_qa",
  CHAT_SENT: "chat_sent",
  DATE_PLAN_SHARED: "date_plan_shared",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

type AnalyticsProperties = Record<string, unknown>;

type PostHogLike = {
  capture?: (eventName: string, properties?: AnalyticsProperties) => void;
};

declare global {
  interface Window {
    posthog?: PostHogLike;
  }
}

export function trackEvent(
  eventName: AnalyticsEventName | string,
  properties?: AnalyticsProperties,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.posthog?.capture?.(eventName, properties);
  } catch {
    // Analytics must never break the product experience.
  }
}
