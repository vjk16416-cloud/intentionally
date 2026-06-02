import { redirect } from "next/navigation";

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
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 6 of 8
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Where do you live?
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick your city, then the neighbourhood you spend the most time in.
          You can change it later.
        </p>
      </header>
      <NeighbourhoodForm
        initialCity={profile?.city ?? null}
        initialNeighbourhood={profile?.neighbourhood ?? null}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </div>
  );
}
