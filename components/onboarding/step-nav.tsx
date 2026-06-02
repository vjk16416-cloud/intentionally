"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepNavProps = {
  // When set, the form is in edit-from-review mode: render a hidden
  // returnTo input (so the action redirects back to /onboarding/review
  // after saving) and swap "Back" for "Cancel".
  returnTo: string | null;
  // Path of the previous linear step, or null for step 1 (no Back).
  previousStep: string | null;
  // useActionState's pending flag.
  pending: boolean;
  // Optional extra disable flag (e.g. photos step disables Continue
  // until 2+ photos are uploaded).
  disabled?: boolean;
  submitLabel?: string;
};

export function StepNav({
  returnTo,
  previousStep,
  pending,
  disabled,
  submitLabel = "Continue",
}: StepNavProps) {
  return (
    <div className="flex items-center gap-2">
      {returnTo ? (
        <input type="hidden" name="returnTo" value={returnTo} />
      ) : null}
      {returnTo ? (
        <Link
          href="/onboarding/review"
          className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
        >
          Cancel
        </Link>
      ) : previousStep ? (
        <Link
          href={previousStep}
          className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
        >
          Back
        </Link>
      ) : null}
      <Button type="submit" size="lg" disabled={pending || disabled}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}
