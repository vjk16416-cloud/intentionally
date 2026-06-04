import Link from "next/link";

const DATE_OPTIONS = [
  {
    title: "Coffee first",
    place: "WatchHouse, Shoreditch",
    time: "Saturday, 2:30pm",
    reason: "Public, relaxed and easy to keep short if needed.",
  },
  {
    title: "Walk and pastries",
    place: "Victoria Park",
    time: "Sunday, 11:00am",
    reason: "Low-pressure setting with space to talk naturally.",
  },
  {
    title: "Casual food",
    place: "Dishoom, Shoreditch",
    time: "Friday, 7:00pm",
    reason: "Public venue, lively atmosphere and easy transport nearby.",
  },
];

export default function DemoDatePlanPage() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="rounded-[1.75rem] border bg-background p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Date prompt
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Ready to meet Maya?
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Based on your Q&amp;A and chat momentum, Intentionally suggests
            safe, public first-date options.
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

        <section className="space-y-3">
          {DATE_OPTIONS.map((option) => (
            <article
              key={option.title}
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
    </main>
  );
}
