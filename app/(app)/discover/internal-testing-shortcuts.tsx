import {
  createInternalTestMatch,
  openInternalTestChat,
  openInternalTestDatePlan,
  openInternalTestSchedule,
  openInternalTestVibeCheck,
} from "./internal-testing-actions";

function ShortcutButton({
  action,
  children,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        className="h-11 w-full rounded-2xl border border-[#d8d0c3] bg-[#fffdf8] px-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-[#f3eee5]"
      >
        {children}
      </button>
    </form>
  );
}

export function InternalTestingShortcuts() {
  return (
    <section className="mx-auto w-full max-w-md px-4 pt-4 md:max-w-3xl lg:max-w-5xl">
      <div className="rounded-[1.5rem] border border-[#d8ccbd] bg-[#fff8ef] p-4 shadow-[0_10px_30px_rgba(74,59,42,0.06)]">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Internal testing
          </p>
          <h2 className="text-lg font-semibold tracking-tight">
            Internal testing shortcuts
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Use these to test the founder journey without waiting for another
            tester.
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <ShortcutButton action={createInternalTestMatch}>
            Create test match
          </ShortcutButton>
          <ShortcutButton action={openInternalTestSchedule}>
            Open schedule
          </ShortcutButton>
          <ShortcutButton action={openInternalTestVibeCheck}>
            Open Vibe Check
          </ShortcutButton>
          <ShortcutButton action={openInternalTestChat}>Open chat</ShortcutButton>
          <ShortcutButton action={openInternalTestDatePlan}>
            Open date plan
          </ShortcutButton>
        </div>

        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Chat and date-plan shortcuts simulate mutual Continue for the internal
          test match only.
        </p>
      </div>
    </section>
  );
}
