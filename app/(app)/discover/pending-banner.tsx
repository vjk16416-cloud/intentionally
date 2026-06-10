"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { PendingMatch } from "@/lib/discover/pending";

import { MatchModal } from "./match-modal";

export function PendingMatchesBanner({
  pending,
}: {
  pending: PendingMatch[];
}) {
  // openIndex tracks which pending match is currently in the modal.
  // Multiple pending matches: View opens the most recent (index 0);
  // future polish could cycle through them. For MVP, single open.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (pending.length === 0) return null;

  const count = pending.length;
  const label = count === 1 ? "new match" : "new matches";

  return (
    <>
      <div className="mx-auto w-full max-w-md p-4 pb-0 md:max-w-3xl lg:max-w-5xl">
        <div className="flex items-center justify-between gap-3 rounded-2xl border bg-muted px-4 py-3">
          <p className="text-sm">
            <span className="font-medium">{count}</span> {label} waiting
          </p>
          <Button
            type="button"
            size="sm"
            onClick={() => setOpenIndex(0)}
          >
            View
          </Button>
        </div>
      </div>
      {openIndex !== null ? (
        <MatchModal
          matchId={pending[openIndex].matchId}
          match={pending[openIndex].other}
          onDismiss={() => setOpenIndex(null)}
        />
      ) : null}
    </>
  );
}
