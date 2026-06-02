import { redirect } from "next/navigation";

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
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 7 of 8
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          When are you usually free?
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick the weekly hours you could realistically take a 10-minute
          video call. We&apos;ll only show you matches whose availability
          overlaps with yours.
        </p>
      </header>
      <AvailabilityForm
        initialSlots={profile?.availability ?? []}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </div>
  );
}
