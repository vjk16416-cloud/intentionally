"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepNavProps = {
  returnTo: string | null;
  previousStep: string | null;
  pending: boolean;
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/70 bg-background/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur sm:px-6">
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