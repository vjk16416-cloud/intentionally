import { redirect } from "next/navigation";

import { StepShell } from "@/components/onboarding/step-shell";
import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { IdentityForm } from "./identity-form";

type IdentityFields = {
  gender: string | null;
  seeking: string[] | null;
};

export default async function IdentityStepPage({
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
  const previousStep = getPreviousStep("/onboarding/identity");

  const { data: profile } = await supabase
    .from("profiles")
    .select("gender, seeking")
    .eq("id", user.id)
    .maybeSingle<IdentityFields>();

  return (
    <StepShell
      stepLabel="Step 2 of 8"
      title="How would you describe yourself?"
      description="Choose the option that feels right for you. This helps us shape a more respectful dating experience."
      progress={25}
      className="mx-auto w-full max-w-md"
    >
      <IdentityForm
        initialGender={profile?.gender ?? null}
        initialSeeking={profile?.seeking ?? []}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </StepShell>
  );
}
