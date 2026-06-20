import Link from "next/link";
import { redirect } from "next/navigation";

import { StepShell } from "@/components/onboarding/step-shell";
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
    <StepShell
      stepLabel="Complete"
      title="You&apos;re in"
      description="Here&apos;s how it works."
      progress={100}
      className="mx-auto w-full max-w-md"
    >
      <OnboardingCompletedTracker userId={user.id} />

      <div className="space-y-3">
        <div className="rounded-2xl border border-[#e6ded0] bg-background/75 p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">1. Match first</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            When you and someone match, one of you sends a Guided Vibe Check
            invite instead of unlocking chat immediately.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e6ded0] bg-background/75 p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">
            2. Ten-minute Guided Vibe Check
          </p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            You answer three guided questions. The listener stays gently softened
            so it feels calmer and less performative.
          </p>
        </div>

        <div className="rounded-2xl border border-[#e6ded0] bg-background/75 p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground">3. Decide privately</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            If you both choose Continue after the Guided Vibe Check, chat
            unlocks. If not, the match closes quietly.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-accent p-4 text-accent-foreground shadow-sm">
        <p className="text-sm font-semibold">
          Ten minutes of real conversation tells you more than ten days of
          texting.
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
          Start discovering
        </Link>
      </div>
    </StepShell>
  );
}
