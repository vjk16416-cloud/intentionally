"use client";

import { useActionState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";
import type { SlotProposal } from "@/lib/scheduling/slots";

import { proposeSlot, type ProposeState } from "./actions";

const INITIAL_STATE: ProposeState = {};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Europe/London",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Europe/London",
});

export function SlotPicker({
  matchId,
  slots,
}: {
  matchId: string;
  slots: SlotProposal[];
}) {
  if (slots.length === 0) {
    return (
      <div className="space-y-2 rounded-2xl border bg-muted p-4 text-center text-sm">
        <p className="font-medium">No mutual times in the next 7 days.</p>
        <p className="text-xs text-muted-foreground">
          One of you needs to widen availability. Either of you can do that.
          You can update yours and try again.
        </p>
        <p>
          <a
            href={`/onboarding/availability?return=/schedule/${matchId}`}
            className="text-xs underline"
          >
            Edit your availability
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {slots.map((slot) => (
        <SlotForm key={slot.scheduledAtIso} matchId={matchId} slot={slot} />
      ))}
    </div>
  );
}

function SlotForm({
  matchId,
  slot,
}: {
  matchId: string;
  slot: SlotProposal;
}) {
  const [state, action, pending] = useActionState(proposeSlot, INITIAL_STATE);
  const dt = new Date(slot.scheduledAtIso);

  return (
    <form action={action}>
      <input type="hidden" name="matchId" value={matchId} />
      <input type="hidden" name="scheduledAt" value={slot.scheduledAtIso} />
      <button
        type="submit"
        disabled={pending}
        onClick={() =>
          trackAnalyticsEvent("scheduleClicked", {
            properties: {
              match_id: matchId,
              scheduled_at: slot.scheduledAtIso,
              source: "slot_picker",
            },
          })
        }
        className="w-full rounded-2xl border bg-card p-4 text-left transition-colors hover:bg-muted disabled:opacity-50"
      >
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium">
            {dateFormatter.format(dt)}
          </span>
          <span className="text-sm">{timeFormatter.format(dt)}</span>
        </div>
        {pending ? (
          <p className="mt-1 text-xs text-muted-foreground">Sending…</p>
        ) : null}
      </button>
      {state.error ? (
        <p className="mt-1 text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
