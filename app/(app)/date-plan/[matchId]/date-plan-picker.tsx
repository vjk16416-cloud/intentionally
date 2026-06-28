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
    <main className="relative isolate min-h-[calc(100vh-57px)] overflow-hidden bg-[#071411] px-4 py-5 text-[#FFF8EC]">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_0%,rgba(243,161,127,0.18)_0%,transparent_28%),radial-gradient(circle_at_88%_14%,rgba(243,161,127,0.12)_0%,transparent_30%),linear-gradient(180deg,#071411_0%,#0D1714_54%,#050D0B_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_58%,rgba(0,0,0,0.48)_100%)]" />

      <div className="mx-auto w-full max-w-md space-y-5 md:max-w-3xl lg:max-w-5xl">
        <header className="rounded-[1.75rem] border border-[#FFF8EC]/12 bg-[#0D1714]/82 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[#F3A17F]">
            Date plan
          </p>
          <h1 className="mt-2 font-serif text-3xl font-medium tracking-[-0.035em] text-[#FFF8EC]">
            Thinking about meeting {otherName}?
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#FFF8EC]/70">
            Now that chat is unlocked, pick a simple, public first-date plan.
            We&apos;ll save it as your preferred plan for this match.
          </p>
        </header>

        <section className="rounded-[1.75rem] bg-[#F3A17F] p-5 text-[#13251F] shadow-[0_18px_48px_rgba(243,161,127,0.22)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#13251F]/60">
            Safety first
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            Keep it public, simple and time-boxed.
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#13251F]/78">
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
            className="border-[#FFF8EC]/12 bg-[#FFF8EC]/6 text-[#FFF8EC]"
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
                className="rounded-[1.5rem] border border-[#FFF8EC]/12 bg-[#0D1714]/76 p-4 shadow-[0_18px_54px_rgba(0,0,0,0.22)] backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-[#FFF8EC]">
                      {option.title}
                    </h2>
                    <p className="mt-1 text-sm text-[#FFF8EC]/58">
                      {option.place}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#FFF8EC]/8 px-3 py-1 text-xs text-[#FFF8EC]/72">
                    {option.time}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-[#FFF8EC]/68">
                  {option.reason}
                </p>

                <form action={action}>
                  <input type="hidden" name="matchId" value={matchId} />
                  <input type="hidden" name="planKey" value={option.key} />
                  <button
                    type="submit"
                    disabled={pending}
                    className="mt-4 h-12 w-full rounded-2xl bg-[#F3A17F] px-4 text-sm font-semibold text-[#13251F] transition hover:bg-[#EA9270] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {selected ? "Shared" : "Share this plan"}
                  </button>
                </form>
              </article>
            );
          })}
        </section>

        <section className="rounded-[1.5rem] border border-[#FFF8EC]/12 bg-[#FFF8EC]/6 p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#FFF8EC]">Before the date</p>
          <p className="mt-1 text-sm leading-6 text-[#FFF8EC]/68">
            Share the plan here, then use chat to agree the final details when
            you both feel comfortable. Keep the first meeting public, simple,
            and easy to leave.
          </p>
        </section>

        <Link
          href={`/chat/${chatId}`}
          className="block rounded-2xl border border-[#FFF8EC]/12 bg-[#FFF8EC]/6 px-4 py-4 text-center text-base font-semibold text-[#FFF8EC] transition hover:bg-[#FFF8EC]/10"
        >
          Back to Chat
        </Link>
      </div>

      {state.sharedPlanKey && sharedPlan ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/55 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-shared-title"
            className="mx-auto w-full max-w-md rounded-t-[2rem] border border-[#FFF8EC]/12 bg-[#0D1714] p-5 text-[#FFF8EC] shadow-xl md:max-w-lg"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#FFF8EC]/18" />
            <p className="text-xs uppercase tracking-[0.22em] text-[#F3A17F]">
              {sharedPlan.title}
            </p>
            <h2
              id="plan-shared-title"
              className="mt-2 font-serif text-2xl font-medium tracking-[-0.035em]"
            >
              Plan shared
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#FFF8EC]/68">
              We&apos;ll let your match know this is your preferred date plan.
            </p>
            <Link
              href={`/chat/${chatId}`}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-2xl bg-[#F3A17F] px-4 text-center text-sm font-semibold text-[#13251F]"
            >
              Done
            </Link>
          </div>
        </div>
      ) : null}
    </main>
  );
}
