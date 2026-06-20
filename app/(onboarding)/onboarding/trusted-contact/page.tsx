import { redirect } from "next/navigation";

import { StepShell } from "@/components/onboarding/step-shell";
import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { TrustedContactForm } from "./trusted-contact-form";

type TrustedContactFields = {
  name: string | null;
  phone_e164: string | null;
  relationship: string | null;
};

export default async function TrustedContactStepPage({
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
  const previousStep = getPreviousStep("/onboarding/trusted-contact");

  const { data: existing } = await supabase
    .from("trusted_contacts")
    .select("name, phone_e164, relationship")
    .eq("user_id", user.id)
    .maybeSingle<TrustedContactFields>();

  return (
    <StepShell
      stepLabel="Step 8 of 8"
      title="Add a trusted contact for extra peace of mind"
      description="Choose someone you trust who could be contacted if you ever use a safety feature. This is private and not shown on your profile."
      progress={100}
      className="mx-auto w-full max-w-md"
    >
      <TrustedContactForm
        initialName={existing?.name ?? null}
        initialPhone={existing?.phone_e164 ?? null}
        initialRelationship={existing?.relationship ?? null}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </StepShell>
  );
}
