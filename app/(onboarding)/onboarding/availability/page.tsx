import { redirect } from "next/navigation";

import { StepShell } from "@/components/onboarding/step-shell";
import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { AvailabilityForm } from "./availability-form";

export default async function AvailabilityStepPage({
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
  const previousStep = getPreviousStep("/onboarding/availability");

  const { data: profile } = await supabase
    .from("profiles")
    .select("availability")
    .eq("id", user.id)
    .maybeSingle<{ availability: number[] | null }>();

  return (
    <StepShell
      stepLabel="Step 7 of 8"
      title="When are you usually free?"
      description="Pick the weekly hours you could realistically take a 10-minute video call. We&apos;ll only show you matches whose availability overlaps with yours."
      progress={88}
      className="mx-auto w-full max-w-md"
    >
      <AvailabilityForm
        initialSlots={profile?.availability ?? []}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </StepShell>
  );
}
