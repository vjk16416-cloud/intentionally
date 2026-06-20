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
        className="fixed right-3 top-[calc(5.25rem+env(safe-area-inset-top))] z-30 rounded-full border border-[#d8ccbd] bg-[#fff8ef] px-3 py-2 text-xs font-semibold text-[#3d342d] shadow-[0_8px_24px_rgba(74,59,42,0.12)] transition hover:bg-[#f3eee5] focus-visible:ring-3 focus-visible:ring-[#7d8a75]/30 sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:right-5 sm:top-auto sm:px-4 sm:text-sm"
      >
        Feedback
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2f2a23]/35 px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))] sm:items-center">
          <div className="w-full max-w-md rounded-[1.75rem] border border-[#d8ccbd] bg-[#fff8ef] p-5 text-[#241c17] shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6f6258]">
                  Alpha feedback
                </p>
                <h2 className="mt-1 text-xl font-semibold text-[#241c17]">
                  Help shape Intentionally
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#6f6258]">
                  Tell us what felt clear, confusing, useful or awkward.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-[#d8ccbd] bg-[#fffdf8] px-3 py-1 text-sm text-[#6f6258] transition hover:bg-[#f3eee5] hover:text-[#241c17] focus-visible:ring-3 focus-visible:ring-[#7d8a75]/30"
                aria-label="Close feedback"
              >
                Close
              </button>
            </div>

            {submitted ? (
              <div className="rounded-2xl bg-[#e2e8dc] p-4 text-sm leading-6 text-[#241c17]">
                Thank you — this helps shape Intentionally.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#241c17]">
                    What felt confusing or unclear?
                  </span>
                  <textarea
                    value={confusing}
                    onChange={(event) => setConfusing(event.target.value)}
                    className="mt-2 min-h-20 w-full rounded-2xl border border-[#d8ccbd] bg-[#fffdf8] px-4 py-3 text-sm text-[#241c17] outline-none transition placeholder:text-[#6f6258] focus:border-[#7d8a75] focus-visible:ring-3 focus-visible:ring-[#7d8a75]/30"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#241c17]">
                    What felt useful or promising?
                  </span>
                  <textarea
                    value={useful}
                    onChange={(event) => setUseful(event.target.value)}
                    className="mt-2 min-h-20 w-full rounded-2xl border border-[#d8ccbd] bg-[#fffdf8] px-4 py-3 text-sm text-[#241c17] outline-none transition placeholder:text-[#6f6258] focus:border-[#7d8a75] focus-visible:ring-3 focus-visible:ring-[#7d8a75]/30"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#241c17]">
                    Did anything feel awkward, unsafe or off?
                  </span>
                  <textarea
                    value={awkward}
                    onChange={(event) => setAwkward(event.target.value)}
                    className="mt-2 min-h-20 w-full rounded-2xl border border-[#d8ccbd] bg-[#fffdf8] px-4 py-3 text-sm text-[#241c17] outline-none transition placeholder:text-[#6f6258] focus:border-[#7d8a75] focus-visible:ring-3 focus-visible:ring-[#7d8a75]/30"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#241c17]">
                    Would you use this before chatting on a dating app?
                  </span>
                  <select
                    value={useBeforeChat}
                    onChange={(event) =>
                      setUseBeforeChat(event.target.value as UseBeforeChat)
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-[#d8ccbd] bg-[#fffdf8] px-4 text-sm text-[#241c17] outline-none transition focus:border-[#7d8a75] focus-visible:ring-3 focus-visible:ring-[#7d8a75]/30"
                  >
                    <option value="">Choose one</option>
                    <option value="Yes">Yes</option>
                    <option value="Maybe">Maybe</option>
                    <option value="No">No</option>
                  </select>
                </label>

                <button
                  type="submit"
                  className="h-12 w-full rounded-2xl bg-[#7d8a75] text-sm font-semibold text-[#fff8ef] shadow-sm transition hover:bg-[#707d69] focus-visible:ring-3 focus-visible:ring-[#7d8a75]/30"
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
