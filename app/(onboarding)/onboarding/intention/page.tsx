import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { IntentionForm } from "./intention-form";

export default async function IntentionStepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("intention")
    .eq("id", user.id)
    .maybeSingle<{ intention: string | null }>();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 4 of 7
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          What are you here for?
        </h1>
        <p className="text-sm text-muted-foreground">
          We use this to nudge the kind of conversations the Q&A will steer
          toward.
        </p>
      </header>
      <IntentionForm initialIntention={profile?.intention ?? null} />
    </div>
  );
}
