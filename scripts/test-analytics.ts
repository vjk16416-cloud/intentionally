import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { buildFunnel, isEmptyAnalyticsRange, percentage } from "@/lib/analytics/dashboard";
import { claimAnalyticsDedupeKey } from "@/lib/analytics/dedupe";
import {
  ANALYTICS_EVENT_NAMES,
  sanitiseAnalyticsProperties,
} from "@/lib/analytics/events";
import type { PostHogDashboardCounts, PostHogDashboardResult } from "@/lib/posthog/server";

function emptyCounts(): PostHogDashboardCounts {
  return Object.fromEntries(
    Object.keys(ANALYTICS_EVENT_NAMES).map((key) => [
      key,
      { last7Days: 0, last30Days: 0 },
    ]),
  ) as PostHogDashboardCounts;
}

test("canonical analytics events cover the Founder Analytics v1 journey without duplicates", () => {
  const required = [
    "onboardingCompleted",
    "discoverViewed",
    "qaInviteSent",
    "qaInviteAccepted",
    "qaInviteDeclined",
    "scheduleStarted",
    "scheduleConfirmed",
    "scheduleCancelled",
    "qaStarted",
    "qaCompleted",
    "qaCancelled",
    "qaNoShow",
    "continueSelected",
    "passSelected",
    "mutualContinue",
    "chatUnlocked",
    "firstMessage",
    "datePlanCreated",
    "verificationStarted",
    "verificationCompleted",
    "verificationFailed",
    "safetyReportCreated",
    "incidentResolved",
  ] as const;

  for (const key of required) {
    assert.ok(ANALYTICS_EVENT_NAMES[key], `${key} is missing`);
  }

  assert.equal(
    new Set(Object.values(ANALYTICS_EVENT_NAMES)).size,
    Object.keys(ANALYTICS_EVENT_NAMES).length,
  );
});

test("analytics properties exclude sensitive content", () => {
  assert.deepEqual(
    sanitiseAnalyticsProperties({
      match_id: "match-1",
      qa_session_id: "session-1",
      email: "person@example.com",
      phone: "+447000000000",
      body: "private message",
      answer: "private answer",
      pass_reason: "private reasoning",
      visibility_mode: "soft_reveal",
      user_agent: "private browser fingerprint",
      unreviewed_context: "must not be captured",
    }),
    { match_id: "match-1", qa_session_id: "session-1" },
  );
});

test("a dedupe key is claimed only once per session storage", () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };

  assert.equal(claimAnalyticsDedupeKey(storage, "discover-view"), true);
  assert.equal(claimAnalyticsDedupeKey(storage, "discover-view"), false);
  assert.equal(claimAnalyticsDedupeKey(storage, undefined), true);
});

test("analytics deduplication fails open when session storage is unavailable", () => {
  const unavailableStorage = {
    getItem: () => {
      throw new Error("Storage is unavailable");
    },
    setItem: () => {
      throw new Error("Storage is unavailable");
    },
  };

  assert.equal(
    claimAnalyticsDedupeKey(unavailableStorage, "discover-view"),
    true,
  );
});

test("the funnel follows the locked MVP order and avoids a false zero conversion", () => {
  const counts = emptyCounts();
  counts.onboardingCompleted.last30Days = 10;
  counts.discoverViewed.last30Days = 8;
  counts.qaInviteSent.last30Days = 4;

  const funnel = buildFunnel(counts, "last30Days");
  assert.deepEqual(
    funnel.map((step) => step.label),
    [
      "Onboarding",
      "Discovery",
      "Q&A invite",
      "Scheduling",
      "Q&A started",
      "Q&A completed",
      "Mutual Continue",
      "Chat unlock",
      "Date planning",
    ],
  );
  assert.equal(funnel[1].conversion, 80);
  assert.equal(funnel[4].conversion, null);
  assert.equal(percentage(0, 0), null);
  assert.equal(isEmptyAnalyticsRange(counts, "last30Days"), false);
  assert.equal(isEmptyAnalyticsRange(emptyCounts(), "last30Days"), true);
});

test("an unavailable source is distinct from a connected source with zero activity", async () => {
  const unavailable: PostHogDashboardResult = {
    status: "unavailable",
    reason: "missing_env",
    message: "not connected",
  };
  const zeroActivity: PostHogDashboardResult = {
    status: "ok",
    counts: emptyCounts(),
  };

  assert.equal(unavailable.status, "unavailable");
  assert.equal(zeroActivity.status, "ok");
  if (zeroActivity.status === "ok") {
    assert.equal(isEmptyAnalyticsRange(zeroActivity.counts, "last30Days"), true);
  }

  const adminLayout = await readFile("app/admin/layout.tsx", "utf8");
  assert.match(adminLayout, /await requireFounder\(\)/);

  const analyticsPage = await readFile("app/admin/analytics/page.tsx", "utf8");
  assert.doesNotMatch(analyticsPage, /getServiceRoleKey|SUPABASE_URL|createSupabaseServiceClient/);
  assert.match(analyticsPage, /Source unavailable/);
  assert.match(analyticsPage, /No private-beta activity yet/);
  assert.match(analyticsPage, /Safety reports/);

  const loadingBoundary = await readFile("app/admin/analytics/loading.tsx", "utf8");
  const errorBoundary = await readFile("app/admin/analytics/error.tsx", "utf8");
  assert.match(loadingBoundary, /aria-busy/);
  assert.match(errorBoundary, /temporarily unavailable/);
});
