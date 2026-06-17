import { redirect } from "next/navigation";

import { StepShell } from "@/components/onboarding/step-shell";
import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { NeighbourhoodForm } from "./neighbourhood-form";

type LocationFields = {
  city: string | null;
  neighbourhood: string | null;
};

export default async function NeighbourhoodStepPage({
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
  const previousStep = getPreviousStep("/onboarding/neighbourhood");

  const { data: profile } = await supabase
    .from("profiles")
    .select("city, neighbourhood")
    .eq("id", user.id)
    .maybeSingle<LocationFields>();

  return (
    <StepShell
      stepLabel="Step 6 of 8"
      title="Where do you live?"
      description="Pick your city, then the neighbourhood you spend the most time in. You can change it later."
      progress={75}
      className="mx-auto w-full max-w-md"
    >
      <NeighbourhoodForm
        initialCity={profile?.city ?? null}
        initialNeighbourhood={profile?.neighbourhood ?? null}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </StepShell>
  );
}
