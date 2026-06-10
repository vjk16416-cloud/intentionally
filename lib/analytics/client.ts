"use client";

import posthog from "posthog-js";

import {
  ANALYTICS_EVENT_NAMES,
  type AnalyticsEventKey,
} from "@/lib/analytics/events";

let initialized = false;

type TrackAnalyticsOptions = {
  properties?: Record<string, unknown>;
  sendInstantly?: boolean;
};

function viewportTier(width: number) {
  if (width >= 1280) return "desktop";
  if (width >= 768) return "tablet";
  return "phone";
}

export function initAnalytics() {
  if (initialized || typeof window === "undefined") return;

  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) return;

  posthog.init(token, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    person_profiles: "identified_only",
  });

  initialized = true;
}

export function trackAnalyticsEvent(
  eventKey: AnalyticsEventKey,
  options: TrackAnalyticsOptions = {},
) {
  if (typeof window === "undefined") return;

  initAnalytics();
  if (!initialized) return;

  posthog.capture(
    ANALYTICS_EVENT_NAMES[eventKey],
    {
      ...options.properties,
      page: window.location.pathname,
      viewport: viewportTier(window.innerWidth),
    },
    {
    send_instantly: options.sendInstantly,
    transport: options.sendInstantly ? "sendBeacon" : undefined,
    },
  );
}
