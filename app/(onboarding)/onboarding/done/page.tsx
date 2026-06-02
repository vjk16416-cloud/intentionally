import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

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
  const state = await getOnboardingState(supabase, user.id);
  if (state.status === "incomplete") {
    redirect(state.nextStep);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          You&apos;re in
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Here&apos;s how it works.
        </h1>
      </header>

      {/* PLACEHOLDER COPY — founder to refine. Must convey:
        match → 10-min live video Q&A (3 therapist-designed questions
        with a soft blur on whoever's listening) → both decide
        privately → only then chat unlocks. Keep it short and
        benefit-led; this is the moment that sets the expectation for
        the video call. */}
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          When you and someone match, the next thing isn&apos;t a text
          message — it&apos;s a{" "}
          <span className="font-medium text-foreground">
            ten-minute live video call
          </span>
          , with three therapist-designed questions to start you off and a
          soft blur on whoever&apos;s listening.
        </p>
        <p>
          When it ends, you both decide privately whether to keep talking.
          Both say yes — chat opens. Either says no — the match closes
          quietly, and we never tell anyone who passed.
        </p>
        <p>
          The idea: ten minutes of real conversation tells you more than
          ten days of texting. We&apos;d rather you find out fast.
        </p>
      </div>

      <div>
        <Link
          href="/discover"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Start browsing
        </Link>
      </div>
    </div>
  );
}
