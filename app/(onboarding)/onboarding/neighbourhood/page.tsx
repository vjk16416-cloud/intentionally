import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { NeighbourhoodForm } from "./neighbourhood-form";

export default async function NeighbourhoodStepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("neighbourhood")
    .eq("id", user.id)
    .maybeSingle<{ neighbourhood: string | null }>();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 6 of 7
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Where in London?
        </h1>
        <p className="text-sm text-muted-foreground">
          Pick the neighbourhood you spend the most time in. You can change it
          later.
        </p>
      </header>
      <NeighbourhoodForm
        initialNeighbourhood={profile?.neighbourhood ?? null}
      />
    </div>
  );
}
