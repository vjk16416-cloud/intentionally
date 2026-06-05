import Link from "next/link";

function InitialAvatar({ label }: { label: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white text-sm font-semibold text-black">
      {label}
    </div>
  );
}

export function UpcomingQaSection() {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">
            Scheduled
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">
            Upcoming Q&amp;A
          </h2>
        </div>

        <Link
          href="/qa/demo-demo-match"
          className="text-sm font-medium underline underline-offset-4"
        >
          View
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        <article className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <InitialAvatar label="M" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">Michael, 30</p>
              <p className="text-sm text-neutral-500">Today, 7:30 PM</p>
            </div>

            <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              In 2h
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-2xl border border-neutral-300 px-3 py-3 text-sm font-medium"
            >
              Reschedule
            </button>

            <Link
              href="/qa/demo-demo-match"
              className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground"
            >
              Join Q&amp;A
            </Link>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <InitialAvatar label="S" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold">Sophia, 26</p>
              <p className="text-sm text-neutral-500">Tomorrow, 6:00 PM</p>
            </div>

            <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium">
              Tomorrow
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-2xl border border-neutral-300 px-3 py-3 text-sm font-medium"
            >
              Reschedule
            </button>

            <button
              type="button"
              className="rounded-2xl bg-neutral-100 px-3 py-3 text-sm font-medium text-neutral-500"
            >
              Remind me
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}