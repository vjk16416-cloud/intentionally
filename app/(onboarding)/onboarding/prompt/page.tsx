import { redirect } from "next/navigation";

import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { PromptForm } from "./prompt-form";

type PromptFields = {
  bio_prompt_key: string | null;
  bio_answer: string | null;
};

export default async function PromptStepPage({
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
  const previousStep = getPreviousStep("/onboarding/prompt");

  const { data: profile } = await supabase
    .from("profiles")
    .select("bio_prompt_key, bio_answer")
    .eq("id", user.id)
    .maybeSingle<PromptFields>();

  return (
    <main className="min-h-[calc(100vh-57px)] bg-background px-5 py-8 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Step 5 of 8
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              Give people something to reply to
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Choose a prompt that makes it easy for someone to start a real
              conversation with you.
            </p>
          </header>

          <div className="mt-6">
            <PromptForm
              initialPromptKey={profile?.bio_prompt_key ?? null}
              initialAnswer={profile?.bio_answer ?? null}
              returnTo={returnTo}
              previousStep={previousStep}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
