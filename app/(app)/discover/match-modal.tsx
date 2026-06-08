"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { computeAge } from "@/lib/age";
import { cn } from "@/lib/utils";

import type { MatchedCard } from "./actions";

export function MatchModal({
  matchId,
  match,
  onDismiss,
}: {
  matchId: string;
  match: MatchedCard;
  onDismiss: () => void;
}) {
  const age = computeAge(match.date_of_birth);
  return (
    <div
      // Full-screen overlay above the deck. Fixed + flex centres the
      // card on every breakpoint. Inert background blur keeps focus
      // on the modal without needing a portal in MVP.
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-3xl border bg-card p-6 shadow-lg">
        <div className="space-y-5 text-center">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              It&apos;s a match
            </p>
            <h2 className="text-3xl font-semibold tracking-tight">
              You and {match.display_name}
            </h2>
          </header>
          {/* Raw <img> for the same reasons as the discover card. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={match.photo_urls[0]}
            alt=""
            className="mx-auto aspect-square w-32 rounded-full border object-cover"
          />
          <p className="text-sm text-muted-foreground">
            {match.display_name}, {age} liked you back. The next step is a
            10-minute video Q&amp;A — schedule it now or come back later.
          </p>
          <div className="flex flex-col gap-2">
            <TrackedLink
              href={`/schedule/${matchId}`}
              eventKey="scheduleClicked"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Schedule your Q&amp;A
            </TrackedLink>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onDismiss}
            >
              Continue browsing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
