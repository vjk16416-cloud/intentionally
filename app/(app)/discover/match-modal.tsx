"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button, buttonVariants } from "@/components/ui/button";
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
  const age = match.age;
  const firstName = match.display_name.split(" ")[0] || match.display_name;
  const initial = firstName.charAt(0).toUpperCase();
  const primaryPhoto = match.photo_urls[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2f2a23]/42 px-4 py-6"
    >
      <div className="w-full max-w-md rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-5 shadow-[0_24px_80px_rgba(47,42,35,0.22)] sm:p-7">
        <div className="space-y-5 text-center">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              MATCH
            </p>
            <h2
              id="match-modal-title"
              className="text-3xl font-semibold leading-tight tracking-tight text-foreground"
            >
              You both chose to connect
            </h2>
          </header>

          <div className="mx-auto flex max-w-xs items-center gap-4 rounded-[1.5rem] border border-[#e6ded0] bg-[#fffdf8] p-3 text-left shadow-[0_10px_30px_rgba(74,59,42,0.08)]">
            {primaryPhoto ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryPhoto}
                  alt={`${match.display_name}, ${age}`}
                  className="h-20 w-20 shrink-0 rounded-[1.25rem] border border-[#e6ded0] object-cover"
                />
              </>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-[#e6ded0] bg-[#f4efe6] text-3xl font-semibold text-[#766c62]">
                {initial}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-tight text-foreground">
                {firstName}, {age}
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Ready for an approximately 10-minute guided Q&A.
              </p>
            </div>
          </div>

          <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
            Invite {firstName} to a guided Q&A before chat opens. You will choose
            a shared time next, and they can accept or suggest another time.
          </p>

          <div className="space-y-3">
            <TrackedLink
              href={`/schedule/${matchId}`}
              eventKey="qaInviteOpened"
              eventProperties={{ match_id: matchId, source: "match_modal" }}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 w-full rounded-2xl bg-[#75886b] text-base font-semibold text-white shadow-[0_12px_30px_rgba(83,104,73,0.24)] hover:bg-[#697b60]",
              )}
            >
              Invite to Q&amp;A
            </TrackedLink>

            <p className="text-xs leading-5 text-muted-foreground">
              Chat unlocks only if you both privately choose Continue after the
              Q&amp;A.
            </p>

            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onDismiss}
              className="h-12 w-full rounded-2xl text-muted-foreground hover:bg-[#f3eee5] hover:text-foreground"
            >
              Keep discovering
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
