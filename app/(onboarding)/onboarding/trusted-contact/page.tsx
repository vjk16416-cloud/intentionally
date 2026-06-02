import { redirect } from "next/navigation";

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
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 8 of 8
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          One trusted person
        </h1>
        <p className="text-sm text-muted-foreground">
          Just one person — a friend or family member we&apos;ll only contact
          about your safety, never about your dating life. You can change who
          it is later, but only one is on file at a time.
        </p>
      </header>
      <TrustedContactForm
        initialName={existing?.name ?? null}
        initialPhone={existing?.phone_e164 ?? null}
        initialRelationship={existing?.relationship ?? null}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </div>
  );
}
