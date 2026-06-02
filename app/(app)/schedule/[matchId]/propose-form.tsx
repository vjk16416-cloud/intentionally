"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { proposeSlot, type ProposeState } from "./actions";

const INITIAL_STATE: ProposeState = {};

function localDateTimeMin(): string {
  const now = new Date(Date.now() + 10 * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}`
  );
}

export function ProposeForm({
  matchId,
  otherName,
  submitLabel,
}: {
  matchId: string;
  otherName: string;
  submitLabel?: string;
}) {
  const [state, action, pending] = useActionState(proposeSlot, INITIAL_STATE);
  const min = localDateTimeMin();

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="matchId" value={matchId} />
      <div className="space-y-1.5">
        <label htmlFor="scheduledAt" className="text-sm font-medium">
          When?
        </label>
        <Input
          id="scheduledAt"
          name="scheduledAt"
          type="datetime-local"
          min={min}
          required
        />
        <p className="text-xs text-muted-foreground">
          London time. At least 10 minutes from now, within the next two weeks.
        </p>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending
          ? "Sending…"
          : (submitLabel ?? `Send proposal to ${otherName}`)}
      </Button>
    </form>
  );
}
