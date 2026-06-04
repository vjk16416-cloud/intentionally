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
  const photoCount = Math.min(card.photo_urls.length, 3);

  return (
    <article className="overflow-hidden rounded-[2.25rem] border border-black/10 bg-background shadow-[0_24px_80px_rgba(0,0,0,0.12)]">
      <div className="relative bg-neutral-950 p-2">
        <div className="relative h-[27rem] overflow-hidden rounded-[1.8rem] bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.photo_urls[0]}
            alt=""
            className="h-full w-full object-cover saturate-[0.92]"
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_20%,_rgba(0,0,0,0.12)_45%,_rgba(0,0,0,0.72)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/20" />

          <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
            <span className="rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-medium text-black shadow-sm backdrop-blur">
              {intentionLabel}
            </span>

            <span className="rounded-full border border-white/20 bg-black/25 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur">
              {card.neighbourhood}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <div className="mb-4 flex gap-1.5">
              {Array.from({ length: photoCount }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full ${
                    i === 0 ? "bg-white" : "bg-white/30"
                  }`}
                />
              ))}
            </div>

            <p className="mb-1 text-xs uppercase tracking-[0.24em] text-white/65">
              Intentionally
            </p>

            <h2 className="text-5xl font-semibold tracking-[-0.05em]">
              {card.display_name}, {age}
            </h2>

            <p className="mt-2 max-w-xs text-sm leading-5 text-white/75">
              A short guided Q&amp;A before chat opens.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <section className="rounded-[1.75rem] border bg-muted/30 p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Prompt
          </p>

          <p className="mt-2 text-base font-semibold tracking-tight">
            {promptText(card.bio_prompt_key)}
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {card.bio_answer}
          </p>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border bg-background px-3 py-3">
            <p className="text-xs font-semibold">Video first</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              No cold chat
            </p>
          </div>

          <div className="rounded-2xl border bg-background px-3 py-3">
            <p className="text-xs font-semibold">Private</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              Mutual decision
            </p>
          </div>

          <div className="rounded-2xl border bg-background px-3 py-3">
            <p className="text-xs font-semibold">Reveal</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              Safety-led
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
