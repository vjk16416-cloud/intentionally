"use client";

import Link from "next/link";
import { useState } from "react";

const lateOptions = ["10 minutes", "15 minutes", "30 minutes", "Reschedule"];

function InitialAvatar({ label }: { label: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
      {label}
    </div>
  );
}

export function UpcomingQaSection() {
  const [lateSheetOpen, setLateSheetOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function showNotice(message: string) {
    setNotice(message);
  }

  function chooseLateOption(option: string) {
    setLateSheetOpen(false);
    showNotice(`We'll let Michael know you're running ${option} late.`);
  }

  return (
    <section className="mt-8">
      {notice ? (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm"
        >
          {notice}
        </div>
      ) : null}

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Next step
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Your Q&amp;A queue
          </h2>
        </div>

        <Link
          href="/qa/demo-demo-match"
          className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        <article className="rounded-[1.75rem] border border-border bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <InitialAvatar label="M" />

              <div className="min-w-0">
                <p className="font-semibold text-foreground">Michael, 30</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Today · 7:30 PM
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              In 2h
            </span>
          </div>

          <div className="mt-4 rounded-2xl bg-muted/40 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Your next guided conversation
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              A short 10-minute Q&amp;A to see if the conversation feels right
              before chat opens. You&apos;ll choose how you appear before
              entering.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Link
              href="/schedule/demo-demo-match"
              className="rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Reschedule
            </Link>

            <Link
              href="/qa/demo-demo-match"
              className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              Enter Q&amp;A
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setLateSheetOpen(true)}
            className="mt-3 w-full rounded-2xl border border-dashed border-border bg-background px-3 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Running late?
          </button>
        </article>

        <article className="rounded-[1.5rem] border border-border bg-card/80 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <InitialAvatar label="S" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">Sophia, 26</p>
              <p className="text-sm text-muted-foreground">
                Tomorrow · 6:00 PM
              </p>
            </div>

            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
              Tomorrow
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                showNotice(
                  "Rescheduling Sophia's Q&A will open the slot picker once live sessions are connected.",
                )
              }
              className="rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Reschedule
            </button>

            <button
              type="button"
              onClick={() =>
                showNotice(
                  "We'll remind you on the morning of the Q&A and one hour before.",
                )
              }
              className="rounded-2xl bg-muted px-3 py-3 text-sm font-semibold text-muted-foreground"
            >
              Remind me
            </button>
          </div>
        </article>
      </div>

      {lateSheetOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-foreground/30 px-3 pb-3"
          role="presentation"
          onClick={() => setLateSheetOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="running-late-title"
            className="mx-auto w-full max-w-md rounded-t-[2rem] border border-border bg-card p-4 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <h3
              id="running-late-title"
              className="text-center text-lg font-semibold tracking-tight"
            >
              Running late?
            </h3>

            <div className="mt-4 space-y-2">
              {lateOptions.map((option) => (
                option === "Reschedule" ? (
                  <Link
                    key={option}
                    href="/schedule/demo-demo-match"
                    className="block w-full rounded-2xl border border-border bg-background px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:bg-muted"
                  >
                    {option}
                  </Link>
                ) : (
                  <button
                    key={option}
                    type="button"
                    onClick={() => chooseLateOption(option)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                  >
                    {option}
                  </button>
                )
              ))}

              <button
                type="button"
                onClick={() => setLateSheetOpen(false)}
                className="w-full rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-background hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
