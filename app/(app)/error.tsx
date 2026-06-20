"use client";

import { useEffect } from "react";

import { FallbackActionLink, FallbackPanel } from "@/components/fallback-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#f8f4ec] px-4 py-5">
      <div className="mx-auto flex min-h-[72vh] w-full max-w-md items-center md:max-w-3xl lg:max-w-5xl">
        <FallbackPanel
          eyebrow="Temporary issue"
          title="We hit a temporary problem"
          description="Try again in a moment. Your profile and messages are still there."
          tone="error"
          note="If the page keeps failing, go back to Discover and try again."
          action={
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-sm hover:opacity-90"
              >
                Try again
              </button>
              <FallbackActionLink href="/discover" primary={false}>
                Back to Discover
              </FallbackActionLink>
            </div>
          }
        />
      </div>
    </main>
  );
}
