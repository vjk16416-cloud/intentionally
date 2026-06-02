"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { LONDON_NEIGHBOURHOODS } from "@/lib/onboarding/constants";

import {
  saveNeighbourhood,
  type NeighbourhoodActionState,
} from "./actions";

const INITIAL_STATE: NeighbourhoodActionState = {};

export function NeighbourhoodForm({
  initialNeighbourhood,
}: {
  initialNeighbourhood: string | null;
}) {
  const [state, action, pending] = useActionState(
    saveNeighbourhood,
    INITIAL_STATE,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="neighbourhood" className="text-sm font-medium">
          Your London neighbourhood
        </label>
        <select
          id="neighbourhood"
          name="neighbourhood"
          defaultValue={initialNeighbourhood ?? ""}
          required
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Choose one…
          </option>
          {LONDON_NEIGHBOURHOODS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          We use this to suggest people near you. London-only for now.
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
