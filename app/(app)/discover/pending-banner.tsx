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
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e6ded0] bg-[#fffdf8] px-4 py-3 shadow-[0_8px_24px_rgba(74,59,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-foreground">
          <span className="font-semibold">{count}</span> {label} ready for a
          Vibe Check invite
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
          Send invite
        </TrackedLink>
      </div>
    </div>
  );
}
