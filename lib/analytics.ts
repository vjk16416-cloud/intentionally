"use client";

import {
  LEGACY_ANALYTICS_EVENT_KEYS,
  type AnalyticsEventKey,
} from "@/lib/analytics/events";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

/**
 * Compatibility boundary for existing client call sites. New code must import
 * trackAnalyticsEvent and a canonical key directly.
 */
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
  DATE_PLAN_SHARED: "date_plan_shared",
} as const;

export function trackEvent(
  eventName: string,
  properties?: Record<string, unknown>,
) {
  if (!(eventName in LEGACY_ANALYTICS_EVENT_KEYS)) return;

  const eventKey = LEGACY_ANALYTICS_EVENT_KEYS[
    eventName as keyof typeof LEGACY_ANALYTICS_EVENT_KEYS
  ] as AnalyticsEventKey;

  trackAnalyticsEvent(eventKey, { properties });
}
