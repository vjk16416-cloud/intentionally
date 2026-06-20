"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { FallbackActionLink, FallbackPanel } from "@/components/fallback-state";
import { AnalyticsEvents, trackEvent } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import {
  DATE_PLAN_OPTIONS,
  getDatePlanOption,
  type DatePlanKey,
} from "@/lib/date-plans/options";

import { shareDatePlan, type ShareDatePlanState } from "./actions";

const INITIAL_STATE: ShareDatePlanState = {};

export function DatePlanPicker({
  userId,
  matchId,
  chatId,
  otherName,
  currentPlanKey,
}: {
  userId: string;
  matchId: string;
  chatId: string;
  otherName: string;
  currentPlanKey: DatePlanKey | null;
}) {
  const [state, action, pending] = useActionState(
    shareDatePlan,
    INITIAL_STATE,
  );
  const hasTrackedView = useRef(false);
  const trackedShareEventIds = useRef(new Set<string>());
  const sharedPlan =
    getDatePlanOption(state.sharedPlanKey) ?? getDatePlanOption(currentPlanKey);

  useEffect(() => {
    if (hasTrackedView.current) return;

    hasTrackedView.current = true;
    trackAnalyticsEvent("datePlanViewed", {
      properties: {
        match_id: matchId,
        chat_id: chatId,
      },
    });
  }, [chatId, matchId]);

  useEffect(() => {
    if (!state.sharedPlanKey || !state.sharedPlanEventId) return;
    if (trackedShareEventIds.current.has(state.sharedPlanEventId)) return;

    trackedShareEventIds.current.add(state.sharedPlanEventId);
    trackEvent(AnalyticsEvents.DATE_PLAN_SHARED, {
      user_id: userId,
      match_id: matchId,
      source: "date_plan",
      plan_key: state.sharedPlanKey,
    });
  }, [matchId, state.sharedPlanEventId, state.sharedPlanKey, userId]);

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto w-full max-w-md space-y-5 md:max-w-3xl lg:max-w-5xl">
        <header className="rounded-[1.75rem] border bg-background p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Date prompt
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Thinking about meeting {otherName}?
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Now that chat is unlocked, pick a simple, public first-date plan.
            We&apos;ll save it as your preferred plan for this match.
          </p>
        </header>

        <section className="rounded-[1.75rem] bg-accent p-5 text-accent-foreground shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-accent-foreground/60">
            Safety-first suggestion
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Keep it public, simple and time-boxed.
          </h2>
          <p className="mt-2 text-sm leading-6 text-accent-foreground/75">
            First dates work best when both people can arrive easily, leave
            comfortably and share the plan with someone they trust.
          </p>
        </section>

        {state.error ? (
          <FallbackPanel
            eyebrow="Date plan"
            title="We couldn&apos;t share that plan"
            description="Try again in a moment. Your chat is still there."
            tone="error"
            note={state.error}
            action={
              <div className="flex flex-wrap gap-3">
                <FallbackActionLink href={`/chat/${chatId}`} primary={false}>
                  Back to Chat
                </FallbackActionLink>
              </div>
            }
          />
        ) : null}

        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DATE_PLAN_OPTIONS.map((option) => {
            const selected =
              option.key === state.sharedPlanKey ||
              (!state.sharedPlanKey && option.key === currentPlanKey);

            return (
              <article
                key={option.key}
                className="rounded-[1.5rem] border bg-background p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight">
                      {option.title}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {option.place}
                    </p>
                  </div>

                  <span className="rounded-full bg-muted px-3 py-1 text-xs">
                    {option.time}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {option.reason}
                </p>

                <form action={action}>
                  <input type="hidden" name="matchId" value={matchId} />
                  <input type="hidden" name="planKey" value={option.key} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="mt-4 h-12 w-full rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {selected ? "Shared" : "Share this plan"}
                  </button>
                </form>
              </article>
            );
          })}
        </section>

        <section className="rounded-[1.5rem] border bg-background p-4 shadow-sm">
          <p className="text-sm font-semibold">Before the date</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Share the plan here, then use chat to agree the final details when
            you both feel comfortable. Keep the first meeting public, simple,
            and easy to leave.
          </p>
        </section>

        <Link
          href={`/chat/${chatId}`}
          className="block rounded-2xl border bg-background px-4 py-4 text-center text-base font-semibold"
        >
          Back to Chat
        </Link>
      </div>

      {state.sharedPlanKey && sharedPlan ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-foreground/30 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-shared-title"
            className="mx-auto w-full max-w-md rounded-t-[2rem] border border-border bg-card p-5 shadow-xl md:max-w-lg"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {sharedPlan.title}
            </p>
            <h2
              id="plan-shared-title"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              Plan shared
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We&apos;ll let your match know this is your preferred date plan.
            </p>
            <Link
              href={`/chat/${chatId}`}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-accent px-4 text-center text-sm font-semibold text-accent-foreground"
            >
              Done
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}
