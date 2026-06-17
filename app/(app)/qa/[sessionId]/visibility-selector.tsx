"use client";

import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";

export type OpenVideoRequestState = "idle" | "pending" | "incoming";

type VisibilitySelectorProps = {
  isOpenVideo: boolean;
  requestState: OpenVideoRequestState;
  onRequestOpenVideo: () => void;
  onPreviewIncomingRequest: () => void;
  onAllowOpenVideo: () => void;
  onKeepSoftReveal: () => void;
  onReturnToSoftReveal: () => void;
};

export function VisibilitySelector({
  isOpenVideo,
  requestState,
  onRequestOpenVideo,
  onPreviewIncomingRequest,
  onAllowOpenVideo,
  onKeepSoftReveal,
  onReturnToSoftReveal,
}: VisibilitySelectorProps) {
  const currentState = isOpenVideo ? "Open Video" : "Soft Reveal";

  function trackVisibilityAction(action: string) {
    trackAnalyticsEvent("visibilitySelected", {
      properties: {
        visibility_mode: isOpenVideo ? "open" : "dynamic",
        visibility_action: action,
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
            {currentState}
          </p>
        </div>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            isOpenVideo
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-foreground",
          )}
        >
          {currentState}
        </span>
      </div>

      {isOpenVideo ? (
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <p className="text-sm leading-6 text-muted-foreground">
            Open Video is on. Either of you can return to Soft Reveal at any
            time.
          </p>
          <button
            type="button"
            onClick={() => {
              trackVisibilityAction("return_to_soft_reveal");
              onReturnToSoftReveal();
            }}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
          >
            Return to Soft Reveal
          </button>
        </div>
      ) : requestState === "pending" ? (
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm leading-6 text-muted-foreground">
              Waiting for your match to agree.
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Open Video makes both videos clear for this Vibe Check. It only
              turns on if both of you agree.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:col-span-2 md:col-span-1">
              Demo match response
            </p>
            <button
              type="button"
              onClick={() => {
                trackVisibilityAction("demo_match_agreed");
                onAllowOpenVideo();
              }}
              className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
            >
              Allow Open Video
            </button>
            <button
              type="button"
              onClick={() => {
                trackVisibilityAction("cancel_open_video_request");
                onKeepSoftReveal();
              }}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
            >
              Keep Soft Reveal
            </button>
          </div>
        </div>
      ) : requestState === "incoming" ? (
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Your match would like to turn Open Video on.
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Open Video makes both videos clear for this Vibe Check. It only
              turns on if both of you agree.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
            <button
              type="button"
              onClick={() => {
                trackVisibilityAction("decline_open_video");
                onKeepSoftReveal();
              }}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
            >
              Keep Soft Reveal
            </button>
            <button
              type="button"
              onClick={() => {
                trackVisibilityAction("allow_open_video");
                onAllowOpenVideo();
              }}
              className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
            >
              Allow Open Video
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm leading-6 text-muted-foreground">
              Only the person answering is clear. The listener stays softened.
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Open Video makes both videos clear for this Vibe Check. It only
              turns on if both of you agree.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
            <button
              type="button"
              onClick={() => {
                trackVisibilityAction("request_open_video");
                onRequestOpenVideo();
              }}
              className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
            >
              Request Open Video
            </button>
            <button
              type="button"
              onClick={() => {
                trackVisibilityAction("demo_incoming_request");
                onPreviewIncomingRequest();
              }}
              className="rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground"
            >
              Demo match request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
