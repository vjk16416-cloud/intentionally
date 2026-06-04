import { redirect } from "next/navigation";

import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { ProfileForm } from "./profile-form";

type ProfileFields = {
  display_name: string | null;
  date_of_birth: string | null;
};

export default async function ProfileStepPage({
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
  const previousStep = getPreviousStep("/onboarding/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, date_of_birth")
    .eq("id", user.id)
    .maybeSingle<ProfileFields>();

  return (
    <main className="min-h-[calc(100vh-57px)] bg-background px-5 py-8 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <section className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Step 1 of 8
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              First, the basics
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Your name and date of birth. You must be 18 or older.
            </p>
          </header>

          <div className="mt-6">
            <ProfileForm
              initialDisplayName={profile?.display_name ?? ""}
              initialDateOfBirth={profile?.date_of_birth ?? ""}
              returnTo={returnTo}
              previousStep={previousStep}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
