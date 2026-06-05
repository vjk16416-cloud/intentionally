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
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-lg items-center gap-2">
        {returnTo ? (
          <input type="hidden" name="returnTo" value={returnTo} />
        ) : null}

        {returnTo ? (
          <Link
            href="/onboarding/review"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-2xl px-5",
            )}
          >
            Cancel
          </Link>
        ) : previousStep ? (
          <Link
            href={previousStep}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-2xl px-5",
            )}
          >
            Back
          </Link>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending || disabled}
          className="flex-1 rounded-2xl bg-accent px-5 text-accent-foreground hover:opacity-90"
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}