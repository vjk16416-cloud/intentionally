import Link from "next/link";

function InitialAvatar({ label }: { label: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
      {label}
    </div>
  );
}

export function UpcomingQaSection() {
  return (
    <section className="mt-8">
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
              before chat opens.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Reschedule
            </button>

            <Link
              href="/qa/demo-demo-match"
              className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground transition hover:opacity-90"
            >
              Join Q&amp;A
            </Link>
          </div>

          <button
            type="button"
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
              className="rounded-2xl border border-border bg-background px-3 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Reschedule
            </button>

            <button
              type="button"
              className="rounded-2xl bg-muted px-3 py-3 text-sm font-semibold text-muted-foreground"
            >
              Remind me
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}