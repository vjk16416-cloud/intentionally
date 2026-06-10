"use client";

import Link from "next/link";
import { useState } from "react";

export function DemoSafetyButton() {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function chooseOption(message: string) {
    setNotice(message);
    setOpen(false);
  }

  return (
    <>
      {notice ? (
        <div
          role="status"
          aria-live="polite"
          className="absolute left-4 right-4 top-20 z-40 rounded-2xl border border-white/10 bg-[#20211b] px-4 py-3 text-sm font-semibold text-white shadow-xl"
        >
          {notice}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-lg shadow-sm"
        aria-label="Safety options"
      >
        🛡
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/50 px-3 pb-3"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-safety-title"
            className="mx-auto w-full max-w-md rounded-t-[2rem] border border-white/10 bg-[#20211b] p-5 text-white shadow-2xl md:max-w-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              Safety
            </p>
            <h2
              id="demo-safety-title"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              What do you need?
            </h2>

            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={() => chooseOption("Report noted for the demo.")}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
              >
                Report
              </button>
              <button
                type="button"
                onClick={() => chooseOption("Block noted for the demo.")}
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
              >
                Block
              </button>
              <Link
                href="/discover"
                className="block w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Leave Q&amp;A
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full rounded-2xl bg-[#eadcc8] px-4 py-3 text-sm font-semibold text-[#241c17]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function DemoMicrophoneButton() {
  const [muted, setMuted] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setMuted((current) => !current)}
      className={
        muted
          ? "flex h-16 w-16 flex-col items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-muted-foreground shadow-sm"
          : "flex h-16 w-16 flex-col items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shadow-sm"
      }
      aria-pressed={muted}
      aria-label={muted ? "Microphone muted" : "Tap to speak"}
    >
      <span className="text-2xl">{muted ? "🔇" : "🎙"}</span>
      <span className="mt-0.5">{muted ? "Muted" : "Speak"}</span>
    </button>
  );
}
