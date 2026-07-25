import type { DashboardEventKey, PostHogDashboardCounts } from "@/lib/posthog/server";

export type AnalyticsRangeKey = "last7Days" | "last30Days";

export type FunnelStep = {
  key: DashboardEventKey;
  label: string;
  value: number;
  conversion: number | null;
};

const FUNNEL_STEPS: readonly [DashboardEventKey, string][] = [
  ["onboardingCompleted", "Onboarding"],
  ["discoverViewed", "Discovery"],
  ["qaInviteSent", "Q&A invite"],
  ["scheduleConfirmed", "Scheduling"],
  ["qaStarted", "Q&A started"],
  ["qaCompleted", "Q&A completed"],
  ["mutualContinue", "Mutual Continue"],
  ["chatUnlocked", "Chat unlock"],
  ["datePlanCreated", "Date planning"],
] as const;

export function percentage(numerator: number, denominator: number) {
  if (denominator === 0) return null;
  return Math.round((numerator / denominator) * 100);
}

export function buildFunnel(
  counts: PostHogDashboardCounts,
  range: AnalyticsRangeKey,
): FunnelStep[] {
  return FUNNEL_STEPS.map(([key, label], index) => {
    const value = counts[key][range];
    const previous = index === 0 ? null : counts[FUNNEL_STEPS[index - 1][0]][range];

    return {
      key,
      label,
      value,
      conversion: previous === null ? null : percentage(value, previous),
    };
  });
}

export function isEmptyAnalyticsRange(
  counts: PostHogDashboardCounts,
  range: AnalyticsRangeKey,
) {
  return Object.values(counts).every((count) => count[range] === 0);
}
