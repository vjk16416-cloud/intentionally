"use client";

import { trackAnalyticsEvent } from "@/lib/analytics/client";

type VisibilitySelectorProps = {
  modeLabel: string;
  modeCopy: string;
};

export function VisibilitySelector({
  modeLabel,
  modeCopy,
}: VisibilitySelectorProps) {
  function trackVisibilityInfo() {
    trackAnalyticsEvent("visibilitySelected", {
      properties: {
        visibility_mode: "dynamic",
        visibility_action: "beta_soft_reveal_info",
        surface: "in_room_visibility_control",
      },
    });
  }

  return (
    <div className="rounded-[1.35rem] border border-[#eadfce] bg-background/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Visibility
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {modeLabel}
          </p>
        </div>

        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
          Beta
        </span>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-sm leading-6 text-muted-foreground">{modeCopy}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Open Video is not available in this beta room because mutual
            consent is not yet persisted between both people.
          </p>
        </div>
        <button
          type="button"
          onClick={trackVisibilityInfo}
          className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
        >
          Soft Reveal stays on
        </button>
      </div>

      <p className="mt-3 rounded-2xl bg-secondary/70 px-3 py-2 text-xs leading-5 text-muted-foreground">
        You can skip any question or leave the Vibe Check if something feels
        uncomfortable. Chat opens only if you both choose Continue afterwards.
      </p>
    </div>
  );
}
