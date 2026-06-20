"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { Button, buttonVariants } from "@/components/ui/button";
import type { PendingMatch } from "@/lib/discover/pending";
import { cn } from "@/lib/utils";

export function PendingMatchesBanner({
  pending,
}: {
  pending: PendingMatch[];
}) {
  const count = pending.length;
  const peopleLabel = count === 1 ? "person is" : "people are";

  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const trigger = triggerRef.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [isOpen]);

  if (count === 0) return null;

  return (
    <>
      <div className="mx-auto w-full max-w-md px-4 pt-3 md:max-w-3xl lg:max-w-5xl lg:pt-4">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex w-full items-center justify-between gap-3 rounded-[1.35rem] border border-[#e1d6c6] bg-[#fffaf3] px-4 py-3 text-left shadow-[0_10px_28px_rgba(74,59,42,0.07)] outline-none transition hover:border-[#cfdcc6] hover:bg-[#fffdf8] focus-visible:ring-3 focus-visible:ring-[#7d916f]/30"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold leading-5 text-[#3d342d]">
              ✨ {count} Vibe {count === 1 ? "Check" : "Checks"} waiting
            </span>
            <span className="mt-0.5 block text-xs font-semibold leading-4 text-[#667a5e] transition group-hover:text-[#536849]">
              Start inviting →
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d8cbbb] bg-[#eef5e8] text-sm font-semibold text-[#536849]"
          >
            {count}
          </span>
        </button>
      </div>

      {isOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2f2a23]/42 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:items-center sm:pb-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pending-vibe-checks-title"
            aria-describedby="pending-vibe-checks-description"
            tabIndex={-1}
            className="w-full max-w-md rounded-t-[2rem] border border-[#e1d6c6] bg-[#fffaf3] p-5 shadow-[0_24px_80px_rgba(47,42,35,0.24)] outline-none sm:rounded-[2rem] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a7c70]">
                  Vibe Checks
                </p>
                <h2
                  id="pending-vibe-checks-title"
                  className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-[#3d342d]"
                >
                  {count} {peopleLabel} ready for a Vibe Check
                </h2>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close Vibe Checks prompt"
                className="rounded-full text-[#6f6258] hover:bg-[#f3eee5] hover:text-[#3d342d]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <p
              id="pending-vibe-checks-description"
              className="mt-3 text-sm leading-6 text-[#6f6258]"
            >
              You matched. Invite them into a guided conversation before chat
              unlocks.
            </p>

            <div className="mt-6 space-y-3">
              <TrackedLink
                href="/vibe-checks"
                eventKey="scheduleClicked"
                eventProperties={{
                  pending_count: count,
                  source: "pending_vibe_checks_prompt",
                }}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 w-full rounded-2xl bg-[#75886b] text-base font-semibold text-white shadow-[0_12px_30px_rgba(83,104,73,0.22)] hover:bg-[#697b60] focus-visible:ring-[#7d916f]/30",
                )}
              >
                Start inviting
              </TrackedLink>

              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setIsOpen(false)}
                className="h-12 w-full rounded-2xl text-[#6f6258] hover:bg-[#f3eee5] hover:text-[#3d342d]"
              >
                Maybe later
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
