"use client";

import { useActionState } from "react";

import { StepNav } from "@/components/onboarding/step-nav";

import { saveIntention, type IntentionActionState } from "./actions";

const INITIAL_STATE: IntentionActionState = {};

const OPTIONS = [
  {
    value: "long-term",
    label: "Long-term",
    hint: "I'm looking for a serious relationship.",
  },
  {
    value: "short-term",
    label: "Short-term",
    hint: "I'm open to something fun, not yet sure where it goes.",
  },
  {
    value: "figuring-it-out",
    label: "Figuring it out",
    hint: "I'm not sure yet. I'll know when I meet someone.",
  },
] as const;

export function IntentionForm({
  initialIntention,
  returnTo,
  previousStep,
}: {
  initialIntention: string | null;
  returnTo: string | null;
  previousStep: string | null;
}) {
  const [state, action, pending] = useActionState(saveIntention, INITIAL_STATE);

  return (
    <form action={action} className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="sr-only">Your intention</legend>
        <div className="space-y-2">
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted has-[:checked]:border-accent has-[:checked]:bg-accent/10"
            >
              <input
                type="radio"
                name="intention"
                value={opt.value}
                defaultChecked={initialIntention === opt.value}
                required
                className="mt-1 size-4 accent-[hsl(var(--accent))]"
              />
              <span className="space-y-0.5">
                <span className="block text-sm font-semibold text-foreground">{opt.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {opt.hint}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <StepNav
        returnTo={returnTo}
        previousStep={previousStep}
        pending={pending}
      />
    </form>
  );
}
