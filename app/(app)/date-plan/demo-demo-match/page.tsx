"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AnalyticsEvents, trackEvent } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import { DATE_PLAN_OPTIONS } from "@/lib/date-plans/options";

export default function DemoDatePlanPage() {
  const [sharedPlan, setSharedPlan] = useState<string | null>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (hasTrackedView.current) return;

    hasTrackedView.current = true;
    trackAnalyticsEvent("datePlanViewed", {
      properties: {
        match_id: "demo-demo-match",
        is_demo_session: true,
      },
    });
  }, []);

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto w-full max-w-md space-y-5 md:max-w-3xl lg:max-w-5xl">
        <header className="rounded-[1.75rem] border bg-background p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Date prompt
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Ready to meet Maya?
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Based on your Guided Vibe Check and chat momentum, Intentionally
            suggests safe, public first-date options.
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

        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DATE_PLAN_OPTIONS.map((option) => (
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

              <button
                type="button"
                onClick={() => {
                  setSharedPlan(option.title);
                  trackEvent(AnalyticsEvents.DATE_PLAN_SHARED, {
                    match_id: "demo-demo-match",
                    source: "date_plan",
                    plan_key: option.key,
                    is_demo_session: true,
                  });
                }}
                className="mt-4 w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
              >
                Share this plan
              </button>
            </article>
          ))}
        </section>

        <section className="rounded-[1.5rem] border bg-background p-4 shadow-sm">
          <p className="text-sm font-semibold">Before the date</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            In the real app, phone numbers unlock three hours before the date,
            with live location sharing and a safety check-in.
          </p>
        </section>

        <Link
          href="/chat/demo-demo-match"
          className="block rounded-2xl border bg-background px-4 py-4 text-center text-base font-semibold"
        >
          Back to Chat
        </Link>
      </div>

      {sharedPlan ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-foreground/30 px-3 pb-3"
          role="presentation"
          onClick={() => setSharedPlan(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plan-shared-title"
            className="mx-auto w-full max-w-md rounded-t-[2rem] border border-border bg-card p-5 shadow-xl md:max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {sharedPlan}
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
            <button
              type="button"
              onClick={() => setSharedPlan(null)}
              className="mt-5 w-full rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
