"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";
import type { AnalyticsEventKey } from "@/lib/analytics/events";

type TrackedLinkProps = ComponentProps<typeof Link> & {
  eventKey: AnalyticsEventKey;
};

export function TrackedLink({
  eventKey,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackAnalyticsEvent(eventKey);
        onClick?.(event);
      }}
    />
  );
}
