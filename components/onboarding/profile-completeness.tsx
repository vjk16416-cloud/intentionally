import { MIN_SLOTS } from "@/lib/onboarding/availability";

type ProfileCompletenessProfile = {
  intention: string | null;
  bio_prompt_key: string | null;
  bio_answer: string | null;
  photos: string[] | null;
  city: string | null;
  neighbourhood: string | null;
  availability: number[] | null;
};

type ProfileCompletenessContact = {
  name: string | null;
  phone_e164: string | null;
} | null;

type CompletenessItem = {
  label: string;
  complete: boolean;
};

function getCompletenessItems(
  profile: ProfileCompletenessProfile | null,
  trustedContact: ProfileCompletenessContact,
): CompletenessItem[] {
  return [
    {
      label: "Photos",
      complete: (profile?.photos?.length ?? 0) >= 2,
    },
    {
      label: "Prompt",
      complete: Boolean(profile?.bio_prompt_key && profile.bio_answer),
    },
    {
      label: "Intention",
      complete: Boolean(profile?.intention),
    },
    {
      label: "Location",
      complete: Boolean(profile?.city && profile.neighbourhood),
    },
    {
      label: "Availability",
      complete: (profile?.availability?.length ?? 0) >= MIN_SLOTS,
    },
    {
      label: "Trusted contact",
      complete: Boolean(trustedContact?.name && trustedContact.phone_e164),
    },
  ];
}

export function ProfileCompleteness({
  profile,
  trustedContact,
}: {
  profile: ProfileCompletenessProfile | null;
  trustedContact: ProfileCompletenessContact;
}) {
  const items = getCompletenessItems(profile, trustedContact);
  const completeCount = items.filter((item) => item.complete).length;
  const totalCount = items.length;
  const percentage = Math.round((completeCount / totalCount) * 100);

  return (
    <section className="rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Profile completeness
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {completeCount} of {totalCount} complete
          </p>
        </div>

        <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
          {percentage}%
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.label}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              item.complete
                ? "border-accent/30 bg-accent/15 text-accent"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {item.label}: {item.complete ? "Done" : "Missing"}
          </span>
        ))}
      </div>
    </section>
  );
}
