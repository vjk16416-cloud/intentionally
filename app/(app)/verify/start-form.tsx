"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { startVerification, type StartVerificationState } from "./actions";

const INITIAL_STATE: StartVerificationState = {};

export function StartForm({ returnTo }: { returnTo: string }) {
  const [state, action, pending] = useActionState(
    startVerification,
    INITIAL_STATE,
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="returnTo" value={returnTo} />
      {state.error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Starting…" : "Start verification"}
      </Button>
      <p className="text-xs text-muted-foreground">
        We use Stripe Identity for verification. Your documents go straight to
        Stripe, not to us.
      </p>
    </form>
  );
}
