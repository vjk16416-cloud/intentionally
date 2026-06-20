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

const OPEN_TO_LABELS: Record<string, string> = {
  "long-term": "something serious, slowly built",
  "short-term": "a thoughtful connection without rushing",
  "figuring-it-out": "seeing what feels real, one step at a time",
};

const AVAILABILITY_SUMMARY =
  "Weekdays: mornings, lunch & evenings. Weekends: late morning & afternoon";

function intentionLabel(intention: string) {
  return INTENTION_LABELS[intention] ?? "intentional connection";
}

function openToLabel(intention: string) {
  return OPEN_TO_LABELS[intention] ?? "a clearer conversation before deciding";
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

function isInternalDemoProfile(name: string) {
  return /^Internal Test\s+/i.test(name);
}

function intentionCopy(card: DiscoverCard) {
  if (isInternalDemoProfile(card.display_name)) {
    return {
      title: "Something relaxed, honest and worth making time for.",
      detail: "A guided Vibe Check before deciding whether to chat.",
    };
  }

  return {
    title:
      intentionLabel(card.intention) ||
      "Looking for something honest, relaxed and worth making time for.",
    detail: openToLabel(card.intention),
  };
}

function readinessItems(card: DiscoverCard) {
  const hasPhotos = card.photo_urls.length >= 2;

  return [
    {
      label: "ID check",
      helper: "Verification status shown where available",
      checked: Boolean(card.id_verified),
    },
    {
      label: "Availability",
      helper: AVAILABILITY_SUMMARY,
      checked: Boolean(card.availability && card.availability.length > 0),
    },
    {
      label: "2 photos added",
      helper: "More coming soon",
      checked: hasPhotos,
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
  const intention = intentionCopy(card);
  const readiness = readinessItems(card);
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
    <main className="min-h-[calc(100vh-57px)] bg-[#f8f4ec] pb-[calc(9rem+env(safe-area-inset-bottom))] text-foreground sm:pb-28 lg:pb-6">
      <div className="mx-auto flex w-full max-w-md flex-col px-4 py-3 sm:px-5 md:max-w-3xl md:py-5 lg:max-w-6xl lg:px-6 lg:py-4 xl:max-w-6xl">
        <header className="mb-2 shrink-0 lg:mb-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-[2rem]">
            Discover
          </h1>
        </header>

        <p className="mb-3 max-w-2xl shrink-0 text-sm leading-5 text-muted-foreground sm:leading-6 lg:mb-4">
          Browse slowly. Mutual interest creates a match. A Vibe Check invite
          happens before chat can unlock.
        </p>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.82fr)] lg:items-stretch">
          <div className="relative min-h-[470px] overflow-hidden rounded-[2rem] border border-[#e6ded0] bg-[#e5e1db] shadow-[0_18px_60px_rgba(74,59,42,0.14)] sm:min-h-[540px] lg:h-[min(640px,calc(100vh-190px))] lg:min-h-[540px]">
            {primaryPhoto ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryPhoto}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,#f6f1e8_0%,#ded9d1_55%,#cfc9bf_100%)]">
                <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/60 bg-[#f8f4ec] text-6xl font-semibold text-[#7a7166] shadow-[0_18px_45px_rgba(74,59,42,0.16)] sm:h-48 sm:w-48 sm:text-7xl">
                  {profileInitial}
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/24 to-black/0" />

            <div className="absolute left-4 top-4 flex max-w-[calc(100%-7rem)] flex-wrap items-center gap-2 sm:left-5 sm:top-5">
              <span className="rounded-full border border-white/25 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                Safety signals
              </span>
              <span className="rounded-full border border-white/25 bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                Intentional
              </span>
              <span className="rounded-full border border-white/25 bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm">
                Vibe Check Ready
              </span>
            </div>

            <div className="absolute right-4 top-4 rounded-full border border-white/25 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm sm:right-5 sm:top-5">
              {index + 1}/{cards.length}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
              <div className="max-w-xl space-y-4 text-primary-foreground lg:space-y-3">
                <div className="space-y-1.5">
                  <h2 className="text-[2.2rem] font-semibold leading-[1.05] tracking-tight sm:text-[2.5rem] lg:text-[2.55rem]">
                    {firstName(visibleProfileName)}, {age}
                  </h2>
                  <p className="text-base leading-6 text-primary-foreground/82">
                    {location}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/18 bg-black/35 p-4 shadow-sm lg:max-w-[92%] lg:p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground/68">
                    PROMPT PREVIEW
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-5 text-primary-foreground/82">
                    {prompt}
                  </p>
                  <p className="mt-2 text-base font-semibold leading-6 text-primary-foreground">
                    “{promptAnswer(card.bio_answer)}”
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-[2rem] border border-[#e6ded0] bg-[#fcf8f0] p-4 shadow-[0_18px_60px_rgba(74,59,42,0.09)] sm:p-5 lg:h-[min(640px,calc(100vh-190px))] lg:min-h-[540px] lg:justify-between lg:p-5">
            <div className="space-y-3">
              <section className="rounded-[1.35rem] border border-[#e6ded0] bg-[#fffdf8] p-4 shadow-[0_10px_30px_rgba(74,59,42,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  INTENTION
                </p>
                <p className="mt-3 text-base font-semibold leading-6 text-foreground lg:mt-2">
                  {intention.title}
                </p>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  {intention.detail ||
                    "A guided Vibe Check before deciding whether to chat."}
                </p>
              </section>

              <section className="rounded-[1.35rem] border border-[#e1e8dc] bg-[#f7faf4] p-4 shadow-[0_10px_30px_rgba(74,59,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  PROFILE READINESS
                </p>
                <ul className="mt-3 space-y-3">
                  {readiness.map((item) => (
                    <li
                      key={item.label}
                      className="grid grid-cols-[1.35rem_minmax(0,1fr)] gap-3 text-sm leading-5 text-foreground"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                          item.checked
                            ? "border-[#7b8b72] bg-[#eef5e8] text-[#536849]"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                        aria-hidden="true"
                      >
                        {item.checked ? "✓" : "•"}
                      </span>
                      <span>
                        <span className="block font-semibold text-foreground">
                          {item.label}
                        </span>
                        {item.label === "Availability" ? (
                          <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">
                            Weekdays: mornings, lunch & evenings
                            <br />
                            Weekends: late morning & afternoon
                            <br />
                            View exact availability after mutual interest.
                          </span>
                        ) : (
                          <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">
                            {item.helper}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="rounded-[1.25rem] border border-[#e1e8dc] bg-[#eef2e8] px-3 py-2.5 text-xs leading-5 text-[#5d6c55] sm:px-4 sm:py-3 sm:text-sm">
                Safety signals are shown where available. Reports and trust
                checks help us keep improving the experience.
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {limitReached ? (
                <p className="rounded-2xl bg-muted px-4 py-3 text-center text-sm text-foreground">
                  You&apos;ve used your daily likes. Passes are still available.
                </p>
              ) : null}

              {actionError ? (
                <p className="rounded-2xl bg-muted px-4 py-3 text-center text-sm text-foreground">
                  {actionError}
                </p>
              ) : null}

              <div className="hidden grid-cols-2 gap-3 sm:grid">
                <button
                  type="button"
                  onClick={handlePass}
                  disabled={pending}
                  className="h-14 rounded-2xl border border-[#d8d0c3] bg-[#fffdf8] text-sm font-semibold text-foreground shadow-sm transition hover:bg-[#f3eee5] active:scale-[0.98] disabled:opacity-50"
                  aria-label="Not for me"
                >
                  Not for me
                </button>

                <button
                  type="button"
                  onClick={handleLike}
                  disabled={pending || limitReached}
                  className="h-14 rounded-2xl bg-[#75886b] text-sm font-semibold text-white shadow-[0_10px_28px_rgba(83,104,73,0.24)] transition hover:bg-[#697b60] active:scale-[0.98] disabled:opacity-50"
                  aria-label="I’m interested"
                >
                  I’m interested
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="fixed inset-x-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50 mx-auto grid max-w-md grid-cols-2 gap-3 rounded-[1.35rem] border border-[#e6ded0] bg-[#fffaf3]/96 p-2 shadow-[0_14px_38px_rgba(74,59,42,0.18)] backdrop-blur sm:hidden">
          <button
            type="button"
            onClick={handlePass}
            disabled={pending}
            className="h-12 rounded-2xl border border-[#d8d0c3] bg-[#fffdf8] text-sm font-semibold text-foreground transition hover:bg-[#f3eee5] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            aria-label="Not for me"
          >
            Not for me
          </button>

          <button
            type="button"
            onClick={handleLike}
            disabled={pending || limitReached}
            className="h-12 rounded-2xl bg-[#75886b] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(83,104,73,0.22)] transition hover:bg-[#697b60] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
            aria-label="I’m interested"
          >
            I’m interested
          </button>
        </div>
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
