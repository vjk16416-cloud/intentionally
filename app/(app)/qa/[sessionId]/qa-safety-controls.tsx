"use client";

import { useEffect, useState } from "react";

type SafetyView = "menu" | "end";

type QaSafetyControlsProps = {
  isPaused: boolean;
  onPause: () => void;
  onEnd: () => void;
  onSoftMode: () => void;
  softModeEnabled: boolean;
};

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M12 3 19 6v5c0 4.6-2.9 8.5-7 10-4.1-1.5-7-5.4-7-10V6l7-3Z" />
      <path d="m9.5 12 1.7 1.7 3.5-3.5" />
    </svg>
  );
}

export function QaSafetyControls({
  isPaused,
  onPause,
  onEnd,
  onSoftMode,
  softModeEnabled,
}: QaSafetyControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<SafetyView>("menu");

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  function close() {
    setIsOpen(false);
    setView("menu");
  }

  function pause() {
    onPause();
    close();
  }

  function enableSoftMode() {
    onSoftMode();
    close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 text-xs font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/30"
        aria-label="Safety options"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <ShieldIcon />
        <span className="hidden sm:inline">Safety</span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2f2a23]/35 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-6 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close safety options"
            className="absolute inset-0 cursor-default"
            onClick={close}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="qa-safety-title"
            className="relative w-full max-w-md rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-5 shadow-[0_24px_80px_rgba(74,59,42,0.20)] sm:p-6"
          >
            {view === "menu" ? (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-accent">
                  <ShieldIcon />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Safety
                </p>
                <h2 id="qa-safety-title" className="mt-2 text-2xl font-semibold tracking-tight">
                  You&apos;re in control.
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  You can pause, soften the room, or leave at any time. If you
                  leave, your reason stays private.
                </p>

                <div className="mt-5 grid gap-2">
                  <button
                    type="button"
                    onClick={pause}
                    disabled={isPaused}
                    className="rounded-2xl border border-border bg-background px-4 py-3.5 text-left text-sm font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPaused ? "Pause in progress" : "Pause for 30 seconds"}
                  </button>
                  <button
                    type="button"
                    onClick={enableSoftMode}
                    className="rounded-2xl border border-border bg-background px-4 py-3.5 text-left text-sm font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/30"
                  >
                    {softModeEnabled ? "Soft Mode is on" : "Switch to Soft Mode"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("end")}
                    className="rounded-2xl border border-[#d9a6a0]/50 bg-[#f6e4df] px-4 py-3.5 text-left text-sm font-semibold text-[#5a2d2a] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#d9a6a0]/40"
                  >
                    End Vibe Check privately
                  </button>
                </div>

                <button
                  type="button"
                  onClick={close}
                  className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/30"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  End Vibe Check
                </p>
                <h2 id="qa-safety-title" className="mt-3 text-2xl font-semibold tracking-tight">
                  Ready to leave this conversation?
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  You&apos;ll move to a private choice screen. Your match will
                  not be told why you left or what you choose next.
                </p>
                <div className="mt-6 grid gap-2">
                  <button
                    type="button"
                    onClick={onEnd}
                    className="rounded-2xl bg-[#5a2d2a] px-4 py-3.5 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#d9a6a0]/40"
                  >
                    End Vibe Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("menu")}
                    className="rounded-2xl border border-border bg-background px-4 py-3.5 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/30"
                  >
                    Keep talking
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
