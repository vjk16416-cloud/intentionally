import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { PromptForm } from "./prompt-form";

type PromptFields = {
  bio_prompt_key: string | null;
  bio_answer: string | null;
};

export default async function PromptStepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("bio_prompt_key, bio_answer")
    .eq("id", user.id)
    .maybeSingle<PromptFields>();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 5 of 7
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">A few words</h1>
        <p className="text-sm text-muted-foreground">
          One prompt, one answer. Specifics beat platitudes.
        </p>
      </header>
      <PromptForm
        initialPromptKey={profile?.bio_prompt_key ?? null}
        initialAnswer={profile?.bio_answer ?? null}
      />
    </div>
  );
}
