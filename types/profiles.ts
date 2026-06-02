// Subset of public.profiles columns used by onboarding-completeness
// checks. Hand-typed for now; replace with generated Supabase types
// once we add `supabase gen types` to the build.

export type ProfileOnboardingFields = {
  display_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  seeking: string[] | null;
  intention: string | null;
  bio_prompt_key: string | null;
  bio_answer: string | null;
  photos: string[] | null;
  city: string | null;
  neighbourhood: string | null;
  availability: number[] | null;
};
