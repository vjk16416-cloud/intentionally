import { redirect } from "next/navigation";

import { StepShell } from "@/components/onboarding/step-shell";
import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { IntentionForm } from "./intention-form";

export default async function IntentionStepPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const returnTo = params.return === "review" ? "/onboarding/review" : null;
  const previousStep = getPreviousStep("/onboarding/intention");

  const { data: profile } = await supabase
    .from("profiles")
    .select("intention")
    .eq("id", user.id)
    .maybeSingle<{ intention: string | null }>();

  return (
    <StepShell
      stepLabel="Step 4 of 8"
      title="What kind of connection are you open to?"
      description="Your answer helps shape the prompts and pace of your Guided Vibe Check experience."
      progress={50}
      className="mx-auto w-full max-w-md"
    >
      <IntentionForm
        initialIntention={profile?.intention ?? null}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </StepShell>
  );
}
