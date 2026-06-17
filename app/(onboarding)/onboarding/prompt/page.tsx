import { redirect } from "next/navigation";

import { StepShell } from "@/components/onboarding/step-shell";
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
    <StepShell
      stepLabel="Step 5 of 8"
      title="Give people something to reply to"
      description="Choose a prompt that makes it easy for someone to start a real conversation with you."
      progress={63}
      className="mx-auto w-full max-w-md"
    >
      <PromptForm
        initialPromptKey={profile?.bio_prompt_key ?? null}
        initialAnswer={profile?.bio_answer ?? null}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </StepShell>
  );
}
