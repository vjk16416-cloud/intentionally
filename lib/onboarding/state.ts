import type { createClient } from "@/lib/supabase/server";
import type { ProfileOnboardingFields } from "@/types/profiles";

// Linear order of onboarding steps. The completeness check returns the
// first incomplete step in this order. ID verification is deliberately
// NOT in this list — it's gated separately before Q&A unlocks (Step 3
// in the build sequence).
export const ONBOARDING_STEPS = [
  "/onboarding/profile",
  "/onboarding/identity",
  "/onboarding/photos",
  "/onboarding/intention",
  "/onboarding/prompt",
  "/onboarding/neighbourhood",
  "/onboarding/trusted-contact",
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export type OnboardingState =
  | { status: "complete" }
  | { status: "incomplete"; nextStep: OnboardingStep };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export async function getOnboardingState(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<OnboardingState> {
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, date_of_birth, gender, seeking, intention, bio_prompt_key, bio_answer, photos, city, neighbourhood",
    )
    .eq("id", userId)
    .maybeSingle<ProfileOnboardingFields>();

  if (!profile) {
    return { status: "incomplete", nextStep: "/onboarding/profile" };
  }

  if (!profile.display_name || !profile.date_of_birth) {
    return { status: "incomplete", nextStep: "/onboarding/profile" };
  }
  if (!profile.gender || !profile.seeking || profile.seeking.length === 0) {
    return { status: "incomplete", nextStep: "/onboarding/identity" };
  }
  if (!profile.photos || profile.photos.length < 2) {
    return { status: "incomplete", nextStep: "/onboarding/photos" };
  }
  if (!profile.intention) {
    return { status: "incomplete", nextStep: "/onboarding/intention" };
  }
  if (!profile.bio_prompt_key || !profile.bio_answer) {
    return { status: "incomplete", nextStep: "/onboarding/prompt" };
  }
  if (!profile.city || !profile.neighbourhood) {
    return { status: "incomplete", nextStep: "/onboarding/neighbourhood" };
  }

  const { count } = await supabase
    .from("trusted_contacts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (!count) {
    return { status: "incomplete", nextStep: "/onboarding/trusted-contact" };
  }

  return { status: "complete" };
}
