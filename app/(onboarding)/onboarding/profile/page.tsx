import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ProfileForm } from "./profile-form";

type ProfileFields = {
  display_name: string | null;
  date_of_birth: string | null;
};

export default async function ProfileStepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, date_of_birth")
    .eq("id", user.id)
    .maybeSingle<ProfileFields>();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 1 of 7
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          First, the basics
        </h1>
        <p className="text-sm text-muted-foreground">
          Your name and date of birth. You must be 18 or older.
        </p>
      </header>
      <ProfileForm
        initialDisplayName={profile?.display_name ?? ""}
        initialDateOfBirth={profile?.date_of_birth ?? ""}
      />
    </div>
  );
}
