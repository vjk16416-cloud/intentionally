"use client";

import { useState } from "react";

import { trackAnalyticsEvent } from "@/lib/analytics/client";

type UseBeforeChat = "Yes" | "Maybe" | "No" | "";

export function AlphaFeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [confusing, setConfusing] = useState("");
  const [useful, setUseful] = useState("");
  const [awkward, setAwkward] = useState("");
  const [useBeforeChat, setUseBeforeChat] = useState<UseBeforeChat>("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    trackAnalyticsEvent("feedbackSubmitted", {
      properties: {
        confusing,
        useful,
        awkward,
        use_before_chat: useBeforeChat,
        page_path: window.location.pathname,
        user_agent: window.navigator.userAgent,
        submitted_at: new Date().toISOString(),
      },
    });

    setSubmitted(true);
  }

  function closeModal() {
    setIsOpen(false);
    setSubmitted(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[calc(10.25rem+env(safe-area-inset-bottom))] right-4 z-30 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-lg transition hover:bg-muted sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:right-5 sm:px-4 sm:text-sm"
      >
        Feedback
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] sm:items-center">
          <div className="w-full max-w-md rounded-[1.75rem] border border-border bg-background p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Alpha feedback
                </p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">
                  Help shape Intentionally
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Tell us what felt clear, confusing, useful or awkward.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition hover:bg-muted"
                aria-label="Close feedback"
              >
                Close
              </button>
            </div>

            {submitted ? (
              <div className="rounded-2xl bg-secondary p-4 text-sm leading-6 text-foreground">
                Thank you — this helps shape Intentionally.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    What felt confusing or unclear?
                  </span>
                  <textarea
                    value={confusing}
                    onChange={(event) => setConfusing(event.target.value)}
                    className="mt-2 min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    What felt useful or promising?
                  </span>
                  <textarea
                    value={useful}
                    onChange={(event) => setUseful(event.target.value)}
                    className="mt-2 min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    Did anything feel awkward, unsafe or off?
                  </span>
                  <textarea
                    value={awkward}
                    onChange={(event) => setAwkward(event.target.value)}
                    className="mt-2 min-h-20 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-accent"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    Would you use this before chatting on a dating app?
                  </span>
                  <select
                    value={useBeforeChat}
                    onChange={(event) =>
                      setUseBeforeChat(event.target.value as UseBeforeChat)
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-accent"
                  >
                    <option value="">Choose one</option>
                    <option value="Yes">Yes</option>
                    <option value="Maybe">Maybe</option>
                    <option value="No">No</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="h-12 w-full rounded-2xl bg-accent text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-90"
                >
                  Send feedback
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
