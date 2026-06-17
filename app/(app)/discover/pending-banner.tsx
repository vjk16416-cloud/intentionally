"use client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { buttonVariants } from "@/components/ui/button";
import type { PendingMatch } from "@/lib/discover/pending";
import { cn } from "@/lib/utils";

export function PendingMatchesBanner({
  pending,
}: {
  pending: PendingMatch[];
}) {
  if (pending.length === 0) return null;

  const [latest] = pending;
  const count = pending.length;
  const label = count === 1 ? "new match" : "new matches";

  return (
    <div className="mx-auto w-full max-w-md p-4 pb-0 md:max-w-3xl lg:max-w-5xl">
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-muted px-4 py-3">
        <p className="text-sm">
          <span className="font-medium">{count}</span> {label} waiting
        </p>
        <TrackedLink
          href={`/schedule/${latest.matchId}`}
          eventKey="scheduleClicked"
          eventProperties={{
            match_id: latest.matchId,
            source: "pending_match_banner",
          }}
          className={cn(buttonVariants({ size: "sm" }), "shrink-0")}
        >
          Send Vibe Check invite
        </TrackedLink>
      </div>
    </div>
  );
}
