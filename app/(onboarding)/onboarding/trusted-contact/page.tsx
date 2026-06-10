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
    <main className="min-h-[calc(100vh-57px)] bg-background px-5 py-8 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Step 8 of 8
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Add a trusted contact for extra peace of mind
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Choose someone you trust who could be contacted if you ever use a
              safety feature. This is only for support and is not shown on your
              profile.
            </p>
          </header>

          <div className="mt-6">
            <TrustedContactForm
              initialName={existing?.name ?? null}
              initialPhone={existing?.phone_e164 ?? null}
              initialRelationship={existing?.relationship ?? null}
              returnTo={returnTo}
              previousStep={previousStep}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
