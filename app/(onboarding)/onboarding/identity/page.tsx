import { redirect } from "next/navigation";

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
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 2 of 8
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">You and them</h1>
        <p className="text-sm text-muted-foreground">
          Used to choose which profiles we show you, and which you appear in.
        </p>
      </header>
      <IdentityForm
        initialGender={profile?.gender ?? null}
        initialSeeking={profile?.seeking ?? []}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </div>
  );
}
