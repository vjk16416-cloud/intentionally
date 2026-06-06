"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import type { DiscoverCard } from "@/lib/discover/feed";

import { likeProfile, passProfile, type MatchedCard } from "./actions";
import { MatchModal } from "./match-modal";
import { UpcomingQaSection } from "./upcoming-qa-section";

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

function InitialAvatar({ label }: { label: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
      {label}
    </div>
  );
}

export function DiscoverDeck({
  cards,
  isDemoMode = false,
}: {
  cards: DiscoverCard[];
  isDemoMode?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const [limitReached, setLimitReached] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeMatch, setActiveMatch] = useState<ActiveMatch | null>(null);

  const card = cards[index];

  const visibleNewMatches = useMemo(() => {
    return cards.slice(0, 3);
  }, [cards]);

  if (cards.length === 0 || !card) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-background px-5 py-8 text-foreground">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center">
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card text-2xl shadow-sm">
              ✦
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Discover
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                You&apos;re all caught up.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                No more profiles for now. New people will appear here when they
                match your preferences.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const age = ageFromDate(card.date_of_birth);

  function openDemoMatch(matchCard = card) {
    setActiveMatch({
      matchId: "demo-match",
      match: {
        id: matchCard.id,
        display_name: matchCard.display_name,
        date_of_birth: matchCard.date_of_birth,
        photo_urls: matchCard.photo_urls,
      },
    });
  }

  function handleLike() {
    setActionError(null);
    const cardId = card.id;

    if (isDemoMode || cardId.startsWith("demo-")) {
      openDemoMatch();
      return;
    }

    startTransition(async () => {
      const result = await likeProfile(cardId);

      if (!result.ok) {
        if (result.error === "limit") {
          setLimitReached(true);
        } else {
          setActionError("Something went wrong. Try again.");
        }
        return;
      }

      if (result.matched) {
        setActiveMatch({ matchId: result.matchId, match: result.with });
      }

      setIndex((current) => current + 1);
    });
  }

  function handlePass() {
    setActionError(null);
    const cardId = card.id;

    if (isDemoMode || cardId.startsWith("demo-")) {
      setIndex((current) => Math.min(current + 1, cards.length));
      return;
    }

    startTransition(async () => {
      await passProfile(cardId);
      setIndex((current) => current + 1);
    });
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-background pb-28 text-foreground">
      <div className="mx-auto w-full max-w-md px-4 py-5 sm:px-5 lg:max-w-lg">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Intentionally
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              Discover
            </h1>
          </div>
        </header>

        <p className="mb-5 max-w-sm text-sm leading-6 text-muted-foreground">
          Browse slowly. If there is mutual interest, you both move into a short
          guided Q&amp;A before chat opens.
        </p>

        <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.photo_urls[0]}
              alt=""
              className="h-[430px] w-full object-cover grayscale"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />

            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
                Video profile
              </span>
              <span className="rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur">
                Intentional
              </span>
            </div>

            <div className="absolute right-4 top-4 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur">
              {index + 1}/{cards.length}
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground">
              <div className="space-y-1">
                <h2 className="text-3xl font-semibold tracking-tight">
                  {firstName(card.display_name)}, {age}
                </h2>

                <p className="text-sm text-primary-foreground/75">
                  {card.neighbourhood} · 3 miles away
                </p>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-white/15 bg-white/15 p-4 shadow-sm backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-primary-foreground/65">
                  Ask me about
                </p>
                <p className="mt-2 text-base font-semibold leading-6">
                  “{card.bio_answer}”
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Video first
              </span>
              <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Low pressure
              </span>
              <span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                Q&amp;A before chat
              </span>
            </div>

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

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handlePass}
                disabled={pending}
                className="h-14 rounded-2xl border border-border bg-background text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted active:scale-[0.98] disabled:opacity-50"
                aria-label="Pass"
              >
                Pass
              </button>

              <button
                type="button"
                onClick={handleLike}
                disabled={pending || limitReached}
                className="h-14 rounded-2xl bg-accent text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                aria-label="Like"
              >
                Like
              </button>
            </div>
          </div>
        </section>

        <UpcomingQaSection />

        <section className="mt-8">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Matches
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            New Matches
          </h2>

          <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-3 sm:-mx-5 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleNewMatches.map((matchCard) => (
              <article key={matchCard.id} className="w-36 shrink-0">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={matchCard.photo_urls[0]}
                    alt=""
                    className="h-44 w-full object-cover grayscale"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-primary-foreground">
                    <p className="text-sm font-semibold">
                      {firstName(matchCard.display_name)},{" "}
                      {ageFromDate(matchCard.date_of_birth)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openDemoMatch(matchCard)}
                  className="mt-2 w-full rounded-xl bg-accent px-3 py-3 text-sm font-semibold text-accent-foreground"
                >
                  Schedule
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Messages
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Unlocked Conversations
          </h2>

          <div className="mt-4 space-y-3">
            <Link
              href="/chat/demo-demo-match"
              className="flex items-center gap-3 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm"
            >
              <InitialAvatar label="R" />

              <div className="min-w-0 flex-1">
                <p className="font-semibold">Rachel, 28</p>
                <p className="text-sm text-muted-foreground">
                  Q&amp;A completed yesterday
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border">
                →
              </span>
            </Link>

            <Link
              href="/chat/demo-demo-match"
              className="flex items-center gap-3 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm"
            >
              <InitialAvatar label="J" />

              <div className="min-w-0 flex-1">
                <p className="font-semibold">James, 31</p>
                <p className="text-sm text-muted-foreground">
                  Q&amp;A completed 2 days ago
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border">
                →
              </span>
            </Link>
          </div>
        </section>

        <nav className="fixed inset-x-4 bottom-4 z-40 mx-auto grid max-w-md grid-cols-4 rounded-[1.5rem] border border-border bg-card/95 p-2 text-center text-xs shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur lg:max-w-lg">
          <Link
            href="/discover"
            className="rounded-2xl bg-accent px-2 py-3 font-semibold text-accent-foreground"
          >
            Discover
          </Link>

          <Link
            href="/qa/demo-demo-match"
            className="rounded-2xl px-2 py-3 font-semibold text-muted-foreground"
          >
            Q&amp;A
          </Link>

          <Link
            href="/chat/demo-demo-match"
            className="rounded-2xl px-2 py-3 font-semibold text-muted-foreground"
          >
            Messages
          </Link>

          <Link
            href="/onboarding/profile"
            className="rounded-2xl px-2 py-3 font-semibold text-muted-foreground"
          >
            Profile
          </Link>
        </nav>
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