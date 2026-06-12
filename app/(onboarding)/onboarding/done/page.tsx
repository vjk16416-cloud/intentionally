import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { OnboardingCompletedTracker } from "./onboarding-completed-tracker";

export default async function OnboardingDonePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // If anything is still missing, push them back to the right step
  // rather than letting them celebrate prematurely.
  const state = await getOnboardingState(supabase, user);
  if (state.status === "incomplete") {
    redirect(state.nextStep);
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-background px-5 py-8 text-foreground">
      <OnboardingCompletedTracker userId={user.id} />
      <div className="mx-auto w-full max-w-md">
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              You&apos;re in
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Here&apos;s how it works.
            </h1>
          </header>

          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">
                1. Match first
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                When you and someone match, we move you towards a short Q&amp;A instead of endless texting.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">
                2. Ten-minute video Q&amp;A
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                You answer three guided questions. The listener stays softly blurred so it feels calmer and less performative.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">
                3. Decide privately
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                If you both want to continue, chat opens. If not, the match closes quietly.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-accent p-4 text-accent-foreground shadow-sm">
            <p className="text-sm font-semibold">
              Ten minutes of real conversation tells you more than ten days of texting.
            </p>
          </div>

          <div className="mt-5">
            <Link
              href="/discover"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full rounded-2xl bg-accent text-accent-foreground hover:opacity-90",
              )}
            >
              Start browsing
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
