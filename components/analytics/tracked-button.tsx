"use client";

import type { ComponentProps } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";
import type { AnalyticsEventKey } from "@/lib/analytics/events";

type TrackedButtonProps = ComponentProps<"button"> & {
  eventKey: AnalyticsEventKey;
};

export function TrackedButton({
  eventKey,
  onClick,
  ...props
}: TrackedButtonProps) {
  return (
    <button
      {...props}
      onClick={(event) => {
        trackAnalyticsEvent(eventKey);
        onClick?.(event);
      }}
    />
  );
}
