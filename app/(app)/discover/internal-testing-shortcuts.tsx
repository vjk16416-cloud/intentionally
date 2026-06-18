import {
  createInternalTestMatch,
  openInternalTestChat,
  openInternalTestDatePlan,
  openInternalTestSchedule,
  openInternalTestVibeCheck,
} from "./internal-testing-actions";
import { ShortcutSubmitButton } from "./shortcut-submit-button";

function ShortcutButton({
  action,
  children,
}: {
  action: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <form action={action}>
      <ShortcutSubmitButton>
        {children}
      </ShortcutSubmitButton>
    </form>
  );
}

export function InternalTestingShortcuts() {
  return (
    <section className="mx-auto w-full max-w-md px-4 py-4 md:max-w-3xl lg:max-w-5xl">
      <details className="group rounded-[1.35rem] border border-dashed border-[#d8ccbd] bg-[#fffdf8]/80 px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <span className="rounded-full border border-[#d8d0c3] bg-[#f8f4ec] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Internal only
            </span>
            Founder shortcuts
          </span>
          <span className="text-xs font-medium text-muted-foreground transition group-open:rotate-180">
            ▾
          </span>
        </summary>

        <div className="mt-3 space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">
            Quick links for testing the founder journey without waiting for
            another tester.
          </p>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <ShortcutButton action={createInternalTestMatch}>
              Create test match
            </ShortcutButton>
            <ShortcutButton action={openInternalTestSchedule}>
              Open schedule
            </ShortcutButton>
            <ShortcutButton action={openInternalTestVibeCheck}>
              Open Vibe Check
            </ShortcutButton>
            <ShortcutButton action={openInternalTestChat}>
              Open chat
            </ShortcutButton>
            <ShortcutButton action={openInternalTestDatePlan}>
              Open date plan
            </ShortcutButton>
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            Chat and date-plan shortcuts simulate mutual Continue for the
            internal test match only.
          </p>
        </div>
      </details>
    </section>
  );
}
