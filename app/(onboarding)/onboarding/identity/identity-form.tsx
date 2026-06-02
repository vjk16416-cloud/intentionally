"use client";

import { useActionState } from "react";

import { StepNav } from "@/components/onboarding/step-nav";

import { saveIdentity, type IdentityActionState } from "./actions";

const INITIAL_STATE: IdentityActionState = {};

const OPTIONS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non-binary", label: "Non-binary" },
] as const;

export function IdentityForm({
  initialGender,
  initialSeeking,
  returnTo,
  previousStep,
}: {
  initialGender: string | null;
  initialSeeking: string[];
  returnTo: string | null;
  previousStep: string | null;
}) {
  const [state, action, pending] = useActionState(saveIdentity, INITIAL_STATE);

  return (
    <form action={action} className="space-y-6">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">I am a…</legend>
        <div className="space-y-2">
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors hover:bg-muted has-[:checked]:border-foreground has-[:checked]:bg-muted"
            >
              <input
                type="radio"
                name="gender"
                value={opt.value}
                defaultChecked={initialGender === opt.value}
                required
                className="size-4"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Show me…</legend>
        <p className="text-xs text-muted-foreground">Pick one or more.</p>
        <div className="space-y-2">
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors hover:bg-muted has-[:checked]:border-foreground has-[:checked]:bg-muted"
            >
              <input
                type="checkbox"
                name="seeking"
                value={opt.value}
                defaultChecked={initialSeeking.includes(opt.value)}
                className="size-4"
              />
              <span className="text-sm font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <StepNav
        returnTo={returnTo}
        previousStep={previousStep}
        pending={pending}
      />
    </form>
  );
}
