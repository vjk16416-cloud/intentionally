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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-4 py-6 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-[2rem] border bg-card p-5 shadow-lg sm:p-7">
        <div className="space-y-6 text-center">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Match
            </p>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight">
              You both chose to connect
            </h2>
          </header>

          {/* Raw <img> for the same reasons as the discover card. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={match.photo_urls[0]}
            alt={`${match.display_name}, ${age}`}
            className="mx-auto aspect-square w-32 rounded-[2rem] border object-cover shadow-sm sm:w-36"
          />

          <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
            There&apos;s mutual interest. Start with a guided Q&amp;A to see if
            the conversation feels right before opening chat.
          </p>

          <div className="space-y-3">
            <TrackedLink
              href={`/schedule/${matchId}`}
              eventKey="scheduleClicked"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 w-full rounded-2xl text-base font-semibold",
              )}
            >
              Start guided Q&amp;A
            </TrackedLink>

            <p className="text-xs leading-5 text-muted-foreground">
              You can pause or leave at any time.
            </p>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onDismiss}
              className="w-full rounded-2xl text-muted-foreground"
            >
              Continue browsing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
