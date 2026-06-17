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
    <section className="rounded-[1.5rem] border border-[#e6ded0] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(74,59,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Profile progress
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {completeCount} of {totalCount} complete
          </p>
        </div>

        <span className="rounded-full border border-[#d8d0c3] bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
          {percentage}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ece3d3]">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item.label}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              item.complete
                ? "border-[#7b8b72] bg-[#eef5e8] text-[#536849]"
                : "border-[#ddd3c4] bg-background text-muted-foreground"
            }`}
          >
            {item.label}: {item.complete ? "Done" : "Missing"}
          </span>
        ))}
      </div>
    </section>
  );
}
