"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { StepNav } from "@/components/onboarding/step-nav";
import { trackAnalyticsEvent } from "@/lib/analytics/client";

import { saveProfile, type ProfileActionState } from "./actions";

const INITIAL_STATE: ProfileActionState = {};

export function ProfileForm({
  initialDisplayName,
  initialDateOfBirth,
  returnTo,
  previousStep,
}: {
  initialDisplayName: string;
  initialDateOfBirth: string;
  returnTo: string | null;
  previousStep: string | null;
}) {
  const [state, action, pending] = useActionState(saveProfile, INITIAL_STATE);

  return (
    <form
      action={action}
      className="space-y-5"
      onSubmit={() =>
        trackAnalyticsEvent("onboardingStarted", {
          properties: {
            step: "profile",
          },
        })
      }
    >
      <div className="space-y-1.5">
        <label htmlFor="displayName" className="text-sm font-semibold text-foreground">
          Display name
        </label>
        <Input
          id="displayName"
          className="h-12 rounded-2xl border-border bg-card px-4 text-base shadow-sm focus-visible:ring-accent"
          name="displayName"
          defaultValue={initialDisplayName}
          maxLength={50}
          autoComplete="given-name"
          required
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Shown to potential matches. Use a name, not a handle.
        </p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="dateOfBirth" className="text-sm font-semibold text-foreground">
          Date of birth
        </label>
        <Input
          id="dateOfBirth"
          className="h-12 rounded-2xl border-border bg-card px-4 text-base shadow-sm focus-visible:ring-accent"
          name="dateOfBirth"
          type="date"
          defaultValue={initialDateOfBirth}
          required
        />
        <p className="text-xs text-muted-foreground">
          You must be 18 or older. We&apos;ll show your age, never your date
          of birth.
        </p>
      </div>
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
