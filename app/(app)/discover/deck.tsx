"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { DiscoverCard } from "@/lib/discover/feed";

import { likeProfile, passProfile, type MatchedCard } from "./actions";
import { MatchModal } from "./match-modal";
import { ProfileCard } from "./profile-card";

type ActiveMatch = { matchId: string; match: MatchedCard };

export function DiscoverDeck({ cards }: { cards: DiscoverCard[] }) {
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const [limitReached, setLimitReached] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [activeMatch, setActiveMatch] = useState<ActiveMatch | null>(null);

  if (cards.length === 0) {
    return (
      <EmptyState
        title="Nothing new here right now."
        body="Check back later — new people are joining London every week."
      />
    );
  }

  if (index >= cards.length) {
    return (
      <EmptyState
        title="You're all caught up."
        body="Take a break. We'll have more people for you to meet soon."
      />
    );
  }

  const card = cards[index];

  function handleLike() {
    setActionError(null);
    const cardId = card.id;
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
      setIndex((i) => i + 1);
    });
  }

  function handlePass() {
    setActionError(null);
    const cardId = card.id;
    startTransition(async () => {
      await passProfile(cardId);
      setIndex((i) => i + 1);
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4 p-4">
      <ProfileCard card={card} />

      {limitReached ? (
        <p className="text-center text-sm text-muted-foreground">
          You&apos;ve used your daily likes. Passes are still available.
        </p>
      ) : null}
      {actionError ? (
        <p className="text-center text-sm text-destructive">{actionError}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handlePass}
          disabled={pending}
        >
          Pass
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleLike}
          disabled={pending || limitReached}
        >
          Like
        </Button>
      </div>

      {activeMatch ? (
        <MatchModal
          matchId={activeMatch.matchId}
          match={activeMatch.match}
          onDismiss={() => setActiveMatch(null)}
        />
      ) : null}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md space-y-3 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
    </main>
  );
}
