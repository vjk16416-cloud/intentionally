"use client";

import { useEffect } from "react";

import {
  FallbackActionLink,
  FallbackPanel,
} from "@/components/fallback-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[onboarding error]", error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#f8f4ec] px-4 py-5">
      <div className="mx-auto flex min-h-[72vh] w-full max-w-md items-center md:max-w-2xl">
        <FallbackPanel
          eyebrow="Temporary issue"
          title="We couldn&apos;t load this step"
          description="Try again in a moment. Your saved onboarding details are still there."
          tone="error"
          note="If it keeps happening, go back to your profile review and continue from there."
          action={
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
              >
                Try again
              </button>
              <FallbackActionLink href="/onboarding/review" primary={false}>
                Review profile
              </FallbackActionLink>
            </div>
          }
        />
      </div>
    </main>
  );
}
