import { redirect } from "next/navigation";

import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { IntentionForm } from "./intention-form";

export default async function IntentionStepPage({
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
  const previousStep = getPreviousStep("/onboarding/intention");

  const { data: profile } = await supabase
    .from("profiles")
    .select("intention")
    .eq("id", user.id)
    .maybeSingle<{ intention: string | null }>();

  return (
    <main className="min-h-[calc(100vh-57px)] bg-background px-5 py-8 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Step 4 of 8
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              What are you here for?
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              This helps guide the kind of conversations your Q&A experience will create.
            </p>
          </header>

          <div className="mt-6">
            <IntentionForm
              initialIntention={profile?.intention ?? null}
              returnTo={returnTo}
              previousStep={previousStep}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
