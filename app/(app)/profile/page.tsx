import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileCompleteness } from "@/components/onboarding/profile-completeness";
import { buttonVariants } from "@/components/ui/button";
import { computeAge } from "@/lib/age";
import { summariseAvailability } from "@/lib/onboarding/availability";
import { BIO_PROMPTS } from "@/lib/onboarding/constants";
import { getOnboardingState } from "@/lib/onboarding/state";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/storage/photos";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { signOut } from "../actions";

type ProfileRow = {
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

type TrustedContactRow = {
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

function labelOf(map: Record<string, string>, value: string | null) {
  return value ? (map[value] ?? value) : "";
}

function promptText(key: string | null) {
  if (!key) return "";
  return BIO_PROMPTS.find((prompt) => prompt.key === key)?.text ?? "";
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
    <section className="rounded-[1.5rem] border border-[#e6ded0] bg-[#fffdf8] px-4 py-3 shadow-[0_10px_30px_rgba(74,59,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Link
          href={editHref}
          className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent hover:text-accent-foreground"
        >
          Edit
        </Link>
      </div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
    .maybeSingle<ProfileRow>();

  const { data: contact } = await supabase
    .from("trusted_contacts")
    .select("name, phone_e164, relationship")
    .eq("user_id", user.id)
    .maybeSingle<TrustedContactRow>();

  if (!profile || !contact) {
    redirect("/onboarding/review");
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
    <main className="bg-[#f8f4ec] px-4 pb-6 pt-4 text-foreground sm:px-5 sm:pb-8 lg:px-6">
      <div className="mx-auto w-full max-w-md space-y-5 md:max-w-3xl">
        <section className="rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-5 shadow-[0_18px_60px_rgba(74,59,42,0.08)] sm:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Profile
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Your profile
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              Review how you show up in Intentionally. You can edit any section
              before a Vibe Check invite.
            </p>
          </div>

          <div className="mt-5">
            <ProfileCompleteness profile={profile} trustedContact={contact} />
          </div>
        </section>

        <div className="space-y-2.5">
          <ReviewSection title="Profile" editHref="/onboarding/profile?return=profile">
            <span className="font-medium text-foreground">
              {profile.display_name}
              {profile.date_of_birth ? `, ${computeAge(profile.date_of_birth)}` : null}
            </span>
          </ReviewSection>

          <ReviewSection title="Identity" editHref="/onboarding/identity?return=profile">
            {labelOf(GENDER_LABELS, profile.gender)}
            {seekingLabel ? ` · seeking ${seekingLabel}` : null}
          </ReviewSection>

          <ReviewSection title="Photos" editHref="/onboarding/photos?return=profile">
            <div className="grid grid-cols-4 gap-2">
              {photoUrls.map((url) => (
                <div
                  key={url}
                  className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="size-full object-cover" />
                </div>
              ))}
            </div>
          </ReviewSection>

          <ReviewSection title="Intention" editHref="/onboarding/intention?return=profile">
            {labelOf(INTENTION_LABELS, profile.intention)}
          </ReviewSection>

          <ReviewSection title="Bio" editHref="/onboarding/prompt?return=profile">
            <p className="font-medium text-foreground">
              {promptText(profile.bio_prompt_key)}
            </p>
            <p className="mt-1">{profile.bio_answer}</p>
          </ReviewSection>

          <ReviewSection
            title="Location"
            editHref="/onboarding/neighbourhood?return=profile"
          >
            {profile.neighbourhood}
            {profile.city ? `, ${profile.city}` : null}
          </ReviewSection>

          <ReviewSection
            title="Availability"
            editHref="/onboarding/availability?return=profile"
          >
            {summariseAvailability(profile.availability ?? [])}
          </ReviewSection>

          <ReviewSection
            title="Trusted contact"
            editHref="/onboarding/trusted-contact?return=profile"
          >
            {contact.name}
            {contact.phone_e164 ? ` · ${contact.phone_e164}` : null}
            {contact.relationship ? ` · ${labelOf(RELATIONSHIP_LABELS, contact.relationship)}` : null}
          </ReviewSection>
        </div>

        <div className="rounded-2xl border border-border bg-background/75 px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Keep it current</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            The profile review stays in sync with onboarding, so you can update
            details from here whenever needed.
          </p>
        </div>

        <Link
          href="/onboarding/review"
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full rounded-2xl bg-accent text-accent-foreground hover:opacity-90",
          )}
        >
          Review full profile
        </Link>

        <section className="rounded-[1.5rem] border border-[#e6ded0] bg-[#fffdf8] px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Account</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">You can sign out from here when you need to use a different account.</p>
          <form action={signOut} className="mt-3">
            <button type="submit" className="text-sm font-semibold text-muted-foreground underline underline-offset-4">Sign out</button>
          </form>
        </section>
      </div>
    </main>
  );
}
