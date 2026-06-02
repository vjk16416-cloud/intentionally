"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { StepNav } from "@/components/onboarding/step-nav";

import {
  saveTrustedContact,
  type TrustedContactActionState,
} from "./actions";

const INITIAL_STATE: TrustedContactActionState = {};

const RELATIONSHIP_OPTIONS = [
  { value: "friend", label: "Friend" },
  { value: "family", label: "Family" },
  { value: "other", label: "Other" },
] as const;

export function TrustedContactForm({
  initialName,
  initialPhone,
  initialRelationship,
  returnTo,
  previousStep,
}: {
  initialName: string | null;
  initialPhone: string | null;
  initialRelationship: string | null;
  returnTo: string | null;
  previousStep: string | null;
}) {
  const [state, action, pending] = useActionState(
    saveTrustedContact,
    INITIAL_STATE,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Their name
        </label>
        <Input
          id="name"
          name="name"
          defaultValue={initialName ?? ""}
          maxLength={80}
          required
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-sm font-medium">
          Phone number
        </label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          placeholder="+447700900123"
          defaultValue={initialPhone ?? ""}
          required
        />
        <p className="text-xs text-muted-foreground">
          E.164 format. We only contact them about your safety, never about
          matches.
        </p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="relationship" className="text-sm font-medium">
          Relationship (optional)
        </label>
        <select
          id="relationship"
          name="relationship"
          defaultValue={initialRelationship ?? ""}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">Prefer not to say</option>
          {RELATIONSHIP_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
