import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { TrustedContactForm } from "./trusted-contact-form";

type TrustedContactFields = {
  name: string | null;
  phone_e164: string | null;
  relationship: string | null;
};

export default async function TrustedContactStepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("trusted_contacts")
    .select("name, phone_e164, relationship")
    .eq("user_id", user.id)
    .maybeSingle<TrustedContactFields>();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 7 of 7
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          One trusted person
        </h1>
        <p className="text-sm text-muted-foreground">
          A friend or family member we&apos;ll only contact about your safety
          — never about your dating life. Required to use Intentionally.
        </p>
      </header>
      <TrustedContactForm
        initialName={existing?.name ?? null}
        initialPhone={existing?.phone_e164 ?? null}
        initialRelationship={existing?.relationship ?? null}
      />
    </div>
  );
}
