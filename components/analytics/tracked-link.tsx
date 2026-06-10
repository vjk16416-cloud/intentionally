"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";
import type { AnalyticsEventKey } from "@/lib/analytics/events";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventKey: AnalyticsEventKey;
  eventProperties?: Record<string, unknown>;
};

export function TrackedLink({
  eventKey,
  eventProperties,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackAnalyticsEvent(eventKey, { properties: eventProperties });
        onClick?.(event);
      }}
    />
  );
}
