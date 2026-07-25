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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e6ded0] bg-[#fffaf3]/96 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_rgba(74,59,42,0.08)] backdrop-blur sm:px-6">
      <div className="mx-auto flex w-full max-w-lg items-center gap-2">
        {returnTo ? (
          <input type="hidden" name="returnTo" value={returnTo} />
        ) : null}

        {returnTo ? (
          <Link
            href="/onboarding/review"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-2xl border-[#d8d0c3] bg-[#fffdf8] px-5 shadow-sm",
            )}
          >
            Cancel
          </Link>
        ) : previousStep ? (
          <Link
            href={previousStep}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "rounded-2xl border-[#d8d0c3] bg-[#fffdf8] px-5 shadow-sm",
            )}
          >
            Back
          </Link>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={pending || disabled}
          className="flex-1 rounded-2xl bg-accent px-5 text-accent-foreground shadow-sm hover:opacity-90"
        >
          {pending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
