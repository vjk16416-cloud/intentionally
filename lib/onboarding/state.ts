import type { User } from "@supabase/supabase-js";

import { MIN_SLOTS } from "@/lib/onboarding/availability";
import type { createClient } from "@/lib/supabase/server";
import type { ProfileOnboardingFields } from "@/types/profiles";

// Linear order of onboarding steps. The completeness check returns the
// first incomplete step in this order. ID verification is deliberately
// NOT in this list — it's gated separately before Q&A unlocks (Step 3
// in the build sequence). /onboarding/phone is ALSO not in this list —
// it's a conditional one-off that fires only for email-auth users
// whose auth.users.phone is null, and we don't want it as a Back-link
// destination from /onboarding/profile.
export const ONBOARDING_STEPS = [
  "/onboarding/profile",
  "/onboarding/identity",
  "/onboarding/photos",
  "/onboarding/intention",
  "/onboarding/prompt",
  "/onboarding/neighbourhood",
  "/onboarding/availability",
  "/onboarding/trusted-contact",
] as const;

// `/onboarding/phone` is a possible nextStep without being in the
// iterable linear array.
export type OnboardingStep =
  | (typeof ONBOARDING_STEPS)[number]
  | "/onboarding/phone";

export type OnboardingState =
  | { status: "complete" }
  | { status: "incomplete"; nextStep: OnboardingStep };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Signature takes the Supabase User (not just userId) because the
// phone-collection gate reads from auth.users.phone, not from
// profiles — every other check here is on profiles, but phone-OTP
// is a Supabase-auth identity field, not profile data.
export async function getOnboardingState(
  supabase: SupabaseServerClient,
  user: User,
): Promise<OnboardingState> {
  // Phone gate fires first. Fires only for email-auth users; phone-OTP
  // users have user.phone set as a side effect of signup.
  if (!user.phone) {
    return { status: "incomplete", nextStep: "/onboarding/phone" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, date_of_birth, gender, seeking, intention, bio_prompt_key, bio_answer, photos, city, neighbourhood, availability",
    )
    .eq("id", user.id)
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
  if (
    !profile.availability ||
    profile.availability.length < MIN_SLOTS
  ) {
    return { status: "incomplete", nextStep: "/onboarding/availability" };
  }

  const { count } = await supabase
    .from("trusted_contacts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!count) {
    return { status: "incomplete", nextStep: "/onboarding/trusted-contact" };
  }

  return { status: "complete" };
}
