import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { computeAge } from "@/lib/age";
import { summariseAvailability } from "@/lib/onboarding/availability";
import { BIO_PROMPTS } from "@/lib/onboarding/constants";
import { getOnboardingState } from "@/lib/onboarding/state";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/storage/photos";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type ReviewProfile = {
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

type ReviewTrustedContact = {
  name: string | null;
  phone_e164: string | null;
  relationship: string | null;
};

const GENDER_LABELS: Record<string, string> = {
  woman: "Woman",
  man: "Man",
  "non-binary": "Non-binary",
};
const INTENTION_LABELS: Record<string, string> = {
  "long-term": "Long-term",
  "short-term": "Short-term",
  "figuring-it-out": "Figuring it out",
};
const RELATIONSHIP_LABELS: Record<string, string> = {
  friend: "Friend",
  family: "Family",
  other: "Other",
};

function labelOf(map: Record<string, string>, value: string | null): string {
  return value ? (map[value] ?? value) : "";
}

function promptText(key: string | null): string {
  if (!key) return "";
  return BIO_PROMPTS.find((p) => p.key === key)?.text ?? "";
}

function ReviewSection({
  title,
  editHref,
  children,
}: {
  title: string;
  editHref: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <Link
          href={editHref}
          className="text-xs underline underline-offset-2 hover:no-underline"
        >
          Edit
        </Link>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

export default async function OnboardingReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Only show review when every step has data. An incomplete user
  // shouldn't be staring at half a profile.
  const state = await getOnboardingState(supabase, user);
  if (state.status === "incomplete") {
    redirect(state.nextStep);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "display_name, date_of_birth, gender, seeking, intention, bio_prompt_key, bio_answer, photos, city, neighbourhood, availability",
    )
    .eq("id", user.id)
    .maybeSingle<ReviewProfile>();

  const { data: contact } = await supabase
    .from("trusted_contacts")
    .select("name, phone_e164, relationship")
    .eq("user_id", user.id)
    .maybeSingle<ReviewTrustedContact>();

  if (!profile || !contact) {
    // The completeness gate should have caught this. Fall back safely.
    redirect("/onboarding");
  }

  const photoUrls = (profile.photos ?? []).map(
    (path) =>
      supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(path).data
        .publicUrl,
  );
  const seekingLabel = (profile.seeking ?? [])
    .map((g) => labelOf(GENDER_LABELS, g))
    .join(", ");

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Review your profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Make sure everything reads the way you want. You can edit any
          section, then come back here.
        </p>
      </header>

      <div className="space-y-3">
        <ReviewSection
          title="Name & age"
          editHref="/onboarding/profile?return=review"
        >
          {profile.display_name}
          {profile.date_of_birth
            ? `, ${computeAge(profile.date_of_birth)}`
            : null}
        </ReviewSection>

        <ReviewSection
          title="Gender & seeking"
          editHref="/onboarding/identity?return=review"
        >
          {labelOf(GENDER_LABELS, profile.gender)}
          {seekingLabel ? ` · seeking ${seekingLabel}` : null}
        </ReviewSection>

        <ReviewSection
          title="Photos"
          editHref="/onboarding/photos?return=review"
        >
          <div className="grid grid-cols-3 gap-2">
            {photoUrls.map((url) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-xl border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="size-full object-cover"
                />
              </div>
            ))}
          </div>
        </ReviewSection>

        <ReviewSection
          title="Intention"
          editHref="/onboarding/intention?return=review"
        >
          {labelOf(INTENTION_LABELS, profile.intention)}
        </ReviewSection>

        <ReviewSection
          title="Bio"
          editHref="/onboarding/prompt?return=review"
        >
          <p className="font-medium text-foreground">
            {promptText(profile.bio_prompt_key)}
          </p>
          <p className="mt-1">{profile.bio_answer}</p>
        </ReviewSection>

        <ReviewSection
          title="Location"
          editHref="/onboarding/neighbourhood?return=review"
        >
          {profile.neighbourhood}
          {profile.city ? `, ${profile.city}` : null}
        </ReviewSection>

        <ReviewSection
          title="Availability"
          editHref="/onboarding/availability?return=review"
        >
          {summariseAvailability(profile.availability ?? [])}
        </ReviewSection>

        <ReviewSection
          title="Trusted contact"
          editHref="/onboarding/trusted-contact?return=review"
        >
          {contact.name}
          {contact.phone_e164 ? ` · ${contact.phone_e164}` : null}
          {contact.relationship
            ? ` · ${labelOf(RELATIONSHIP_LABELS, contact.relationship)}`
            : null}
        </ReviewSection>
      </div>

      <p className="text-xs text-muted-foreground">
        You&apos;ll be ID-verified once — just before your first Q&amp;A
        call. Not now.
      </p>

      <div>
        <Link
          href="/onboarding/done"
          className={cn(buttonVariants({ size: "lg" }))}
        >
          Looks good — continue
        </Link>
      </div>
    </div>
  );
}
