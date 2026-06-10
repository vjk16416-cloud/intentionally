"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

import { confirmSlot, type ConfirmState } from "./actions";

const INITIAL_STATE: ConfirmState = {};

export function ConfirmButtons({ matchId }: { matchId: string }) {
  const [state, action, pending] = useActionState(confirmSlot, INITIAL_STATE);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="matchId" value={matchId} />
      {state.error ? (
        <p className="text-center text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        onClick={() =>
          trackAnalyticsEvent("scheduleClicked", {
            properties: {
              match_id: matchId,
              source: "confirm_buttons",
            },
          })
        }
        className="w-full"
      >
        {pending ? "Confirming…" : "Confirm this time"}
      </Button>
    </form>
  );
}
