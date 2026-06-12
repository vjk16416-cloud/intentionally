"use client";

import { useEffect } from "react";

import { AnalyticsEvents, trackEvent } from "@/lib/analytics";

export function OnboardingCompletedTracker({ userId }: { userId: string }) {
  useEffect(() => {
    trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
      user_id: userId,
      source: "onboarding",
      final_step: "review",
    });
  }, [userId]);

  return null;
}
