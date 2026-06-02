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
    <div className="space-y-6 text-center">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">You&apos;re in.</h1>
        <p className="text-sm text-muted-foreground">
          Your profile is live. We&apos;ll ask you to verify your ID once,
          right before your first Q&amp;A call — not now.
        </p>
      </header>
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
