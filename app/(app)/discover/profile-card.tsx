"use client";

import { computeAge } from "@/lib/age";
import type { DiscoverCard } from "@/lib/discover/feed";
import { BIO_PROMPTS } from "@/lib/onboarding/constants";

const INTENTION_LABELS: Record<string, string> = {
  "long-term": "Long-term",
  "short-term": "Short-term",
  "figuring-it-out": "Figuring it out",
};

function promptText(key: string): string {
  return BIO_PROMPTS.find((p) => p.key === key)?.text ?? key;
}

export function ProfileCard({ card }: { card: DiscoverCard }) {
  const age = computeAge(card.date_of_birth);
  const intentionLabel = INTENTION_LABELS[card.intention] ?? card.intention;
  return (
    <div className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      {/* Raw <img>: photos are user-uploaded and the bucket host is
        variable per env; not worth wiring next/image remotePatterns
        for MVP. Same reasoning as the photos onboarding step. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={card.photo_urls[0]}
        alt=""
        className="aspect-[4/5] w-full object-cover"
      />
      <div className="space-y-3 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            {card.display_name}, {age}
          </h2>
          <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs">
            {intentionLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{card.neighbourhood}</p>
        <div className="space-y-1 rounded-2xl bg-muted p-3">
          <p className="text-xs font-medium">
            {promptText(card.bio_prompt_key)}
          </p>
          <p className="text-sm">{card.bio_answer}</p>
        </div>
      </div>
    </div>
  );
}
