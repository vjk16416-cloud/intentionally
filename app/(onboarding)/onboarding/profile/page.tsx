import { redirect } from "next/navigation";

import { ProfileCompleteness } from "@/components/onboarding/profile-completeness";
import { StepShell } from "@/components/onboarding/step-shell";
import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { ProfileForm } from "./profile-form";

type ProfileFields = {
  display_name: string | null;
  date_of_birth: string | null;
  intention: string | null;
  bio_prompt_key: string | null;
  bio_answer: string | null;
  photos: string[] | null;
  city: string | null;
  neighbourhood: string | null;
  availability: number[] | null;
};

type TrustedContactFields = {
  name: string | null;
  phone_e164: string | null;
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
    .select(
      "display_name, date_of_birth, intention, bio_prompt_key, bio_answer, photos, city, neighbourhood, availability",
    )
    .eq("id", user.id)
    .maybeSingle<ProfileFields>();

  const { data: trustedContact } = await supabase
    .from("trusted_contacts")
    .select("name, phone_e164")
    .eq("user_id", user.id)
    .maybeSingle<TrustedContactFields>();

  return (
    <StepShell
      stepLabel="Step 1 of 8"
      title="Start with the basics"
      description="We&apos;ll only show your first name and age to potential matches."
      progress={12}
      className="mx-auto w-full max-w-md"
    >
      <ProfileCompleteness
        profile={profile ?? null}
        trustedContact={trustedContact ?? null}
      />

      <div className="mt-6">
        <ProfileForm
          initialDisplayName={profile?.display_name ?? ""}
          initialDateOfBirth={profile?.date_of_birth ?? ""}
          returnTo={returnTo}
          previousStep={previousStep}
          userId={user.id}
        />
      </div>
    </StepShell>
  );
}
