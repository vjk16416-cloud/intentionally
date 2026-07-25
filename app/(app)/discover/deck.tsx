"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { AnalyticsEvents, trackEvent } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { FallbackActionLink, FallbackPanel } from "@/components/fallback-state";
import type { DiscoverCard } from "@/lib/discover/feed";
import { BIO_PROMPTS } from "@/lib/onboarding/constants";

import { likeProfile, passProfile, type MatchedCard } from "./actions";
import { DemoResetButton } from "./demo-reset-button";
import { MatchModal } from "./match-modal";

type ActiveMatch = { matchId: string; match: MatchedCard };

function ageFromDate(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  const today = new Date();

  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
}

function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

function stripInternalPrefix(name: string) {
  return name.replace(/^Internal Test\s+/i, "").trim();
}

function visibleName(name: string) {
  return stripInternalPrefix(name) || name;
}

const INTENTION_LABELS: Record<string, string> = {
  "long-term": "intentional dating",
  "short-term": "something lighter, honestly held",
  "figuring-it-out": "clarity through conversation",
};

function intentionLabel(intention: string) {
  return INTENTION_LABELS[intention] ?? "intentional connection";
}

function promptText(promptKey: string) {
  return (
    BIO_PROMPTS.find((prompt) => prompt.key === promptKey)?.text ??
    "A small thing that makes me feel cared for is…"
  );
}

function locationLabel(card: DiscoverCard) {
  if (card.neighbourhood && card.city) {
    return `${card.neighbourhood}, ${card.city}`;
  }

  return card.neighbourhood || "Still completing this section";
}

function promptAnswer(answer: string | null | undefined) {
  return (
    answer?.trim() ||
    "They have not answered this one yet, so start with the Guided Vibe Check."
  );
}

function trustItems(card: DiscoverCard) {
  return [
    {
      label: "Verified",
      checked: Boolean(card.id_verified),
    },
    {
      label: "Availability set",
      checked: Boolean(card.availability && card.availability.length > 0),
    },
    {
      label: "Photos added",
      checked: card.photo_urls.length >= 2,
    },
  ];
}

export function DiscoverDeck({
  cards,
}: {
  cards: DiscoverCard[];
}) {
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const [limitReached, setLimitReached] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeMatch, setActiveMatch] = useState<ActiveMatch | null>(null);

  const card = cards[index];
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (hasTrackedView.current) return;

    hasTrackedView.current = true;
    trackAnalyticsEvent("discoverViewed", {
      properties: {
        card_count: cards.length,
      },
    });
  }, [card, cards.length]);

  if (cards.length === 0 || !card) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-[#f8f4ec] px-5 py-4 text-foreground md:py-8">
        <div className="mx-auto flex min-h-[58vh] w-full max-w-md items-center justify-center md:min-h-[70vh] md:max-w-2xl">
          <FallbackPanel
            eyebrow="Discover"
            title="You&apos;re all caught up"
            description="You have seen everyone available for now. New profiles will appear as the community grows around your preferences."
            note="Reviewing your profile can help future matches understand you more clearly."
            action={
              <div className="space-y-3">
                <FallbackActionLink href="/onboarding/review">
                  Review profile
                </FallbackActionLink>
                <div className="flex justify-center">
                  <DemoResetButton />
                </div>
              </div>
            }
            className="text-center"
          />
        </div>
      </main>
    );
  }

  const age = ageFromDate(card.date_of_birth);
  const prompt = promptText(card.bio_prompt_key);
  const location = locationLabel(card);
  const visibleProfileName = visibleName(card.display_name);
  const trust = trustItems(card);
  const primaryPhoto = card.photo_urls[0];
  const profileInitial = firstName(visibleProfileName).charAt(0).toUpperCase();

  function handleLike() {
    setActionError(null);
    setActiveMatch(null);
    trackEvent(AnalyticsEvents.PROFILE_LIKED, {
      target_profile_id: card.id,
      source: "discover",
    });
    const cardId = card.id;

    startTransition(async () => {
      const result = await likeProfile(cardId);

      if (!result.ok) {
        if (result.error === "limit") {
          setLimitReached(true);
        } else {
          setActionError("We could not save that choice. Try again in a moment.");
        }
        return;
      }

      if (result.matched) {
        trackEvent(AnalyticsEvents.MATCH_CREATED, {
          target_profile_id: cardId,
          match_id: result.matchId,
          source: "discover",
        });
        setActiveMatch({ matchId: result.matchId, match: result.with });
        return;
      }

      setIndex((current) => current + 1);
    });
  }

  function handlePass() {
    setActionError(null);
    setActiveMatch(null);
    trackEvent(AnalyticsEvents.PROFILE_PASSED, {
      target_profile_id: card.id,
      source: "discover",
    });
    const cardId = card.id;

    startTransition(async () => {
      await passProfile(cardId);
      setIndex((current) => current + 1);
    });
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#f8f4ec] pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-foreground sm:pb-10 lg:pb-6">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 pb-2 pt-2 sm:px-5 sm:pt-3 md:max-w-3xl md:pb-5 md:pt-5 lg:max-w-6xl lg:px-6 lg:py-4 xl:max-w-6xl">
        <header className="mb-1 shrink-0 md:mb-2">
          <h1 className="text-[1.55rem] font-semibold tracking-tight sm:text-3xl lg:text-[2rem]">
            Discover
          </h1>
        </header>

        <p className="mb-2 hidden max-w-2xl shrink-0 text-sm leading-6 text-muted-foreground md:block lg:mb-4">
          Browse slowly. Mutual interest creates a match. A Vibe Check invite
          happens before chat can unlock.
        </p>

        <section className="grid gap-3 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] lg:items-start">
          <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-[#e6ded0] bg-[#e5e1db] shadow-[0_18px_60px_rgba(74,59,42,0.14)] sm:min-h-[520px] lg:sticky lg:top-4 lg:h-[min(640px,calc(100vh-170px))] lg:min-h-[560px]">
            {primaryPhoto ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryPhoto}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-[center_18%]"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,#f6f1e8_0%,#ded9d1_55%,#cfc9bf_100%)]">
                <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/60 bg-[#f8f4ec] text-6xl font-semibold text-[#7a7166] shadow-[0_18px_45px_rgba(74,59,42,0.16)] sm:h-48 sm:w-48 sm:text-7xl">
                  {profileInitial}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:sticky lg:top-4">
            <section className="rounded-[2rem] border border-[#e6ded0] bg-[#fcf8f0] p-4 shadow-[0_18px_60px_rgba(74,59,42,0.09)] sm:p-5">
              <div className="space-y-1.5">
                <h2 className="text-[2rem] font-semibold tracking-tight text-foreground sm:text-[2.25rem]">
                  {firstName(visibleProfileName)}, {age}
                </h2>
                <p className="text-base leading-6 text-muted-foreground">
                  {location}
                </p>
                <p className="text-sm font-medium leading-6 text-[#667a5e]">
                  {intentionLabel(card.intention)}
                </p>
              </div>

              <div className="mt-3 rounded-[1.35rem] border border-[#e1e8dc] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(74,59,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Trust
                </p>
                <ul className="mt-3 space-y-2.5">
                  {trust.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-center gap-2 text-sm font-medium leading-5 text-foreground"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                          item.checked
                            ? "border-[#7b8b72] bg-[#eef5e8] text-[#536849]"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      >
                        {item.checked ? "✓" : "•"}
                      </span>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-[2rem] border border-[#e6ded0] bg-[#fffdf8] p-4 shadow-[0_18px_60px_rgba(74,59,42,0.07)] sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Prompt preview
              </p>
              <p className="mt-3 text-base font-semibold leading-6 text-foreground">
                {prompt}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                “{promptAnswer(card.bio_answer)}”
              </p>
            </section>

            <section className="rounded-[2rem] border border-[#dfe7d9] bg-[#eef5e8] p-4 shadow-[0_18px_60px_rgba(74,59,42,0.07)] sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6c7e60]">
                Vibe Check
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                Ready for a Vibe Check?
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#5f6f57]">
                A guided 10-minute conversation to help both people decide
                whether there&apos;s a genuine connection.
              </p>

              <div className="mt-4">
                <p className="text-sm leading-6 text-[#5f6f57]">
                  If the interest is mutual, you can invite them to a Vibe
                  Check before chat unlocks.
                </p>
              </div>
            </section>

            <div className="space-y-3">
              {limitReached ? (
                <p className="rounded-2xl border border-[#e6ded0] bg-[#fffdf8] px-4 py-3 text-center text-sm text-foreground shadow-[0_10px_26px_rgba(74,59,42,0.06)]">
                  You&apos;ve used your daily likes. Passes are still available.
                </p>
              ) : null}

              {actionError ? (
                <p className="rounded-2xl border border-[#e6ded0] bg-[#fffdf8] px-4 py-3 text-center text-sm text-foreground shadow-[0_10px_26px_rgba(74,59,42,0.06)]">
                  {actionError}
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handlePass}
                  disabled={pending}
                  className="h-12 rounded-2xl border border-[#d8d0c3] bg-[#fffdf8] text-sm font-semibold text-[#3d342d] shadow-sm transition hover:bg-[#f3eee5] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Not for me"
                >
                  Not for me
                </button>

                <button
                  type="button"
                  onClick={handleLike}
                  disabled={pending || limitReached}
                  className="h-12 rounded-2xl border border-[#cbd7c0] bg-[#eaf1e3] text-sm font-semibold text-[#536849] shadow-sm transition hover:bg-[#e1ebda] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="I’m interested"
                >
                  I’m interested
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {activeMatch ? (
        <MatchModal
          matchId={activeMatch.matchId}
          match={activeMatch.match}
          onDismiss={() => {
            setActiveMatch(null);
            setIndex((current) => Math.min(current + 1, cards.length));
          }}
        />
      ) : null}
    </main>
  );
}
