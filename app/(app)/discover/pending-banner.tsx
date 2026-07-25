"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import type { PendingMatch } from "@/lib/discover/pending";
import { cn } from "@/lib/utils";

export function PendingMatchesBanner({
  pending,
}: {
  pending: PendingMatch[];
}) {
  const count = pending.length;
  const firstPending = pending[0];
  const firstName = firstPending?.other.display_name
    .replace(/^Internal Test\s+/i, "")
    .split(" ")[0];
  const avatarInitial = firstName?.slice(0, 1).toUpperCase() ?? "✨";
  const primaryScheduleHref = firstPending
    ? `/schedule/${firstPending.matchId}`
    : "/vibe-checks";

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
      <div className="mx-auto w-full max-w-md px-4 pt-2 md:max-w-3xl md:pt-3 lg:max-w-5xl lg:pt-4">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex w-full items-center justify-between gap-3 rounded-full border border-[#e1d6c6] bg-[#fffaf3] px-3 py-2.5 text-left shadow-[0_8px_22px_rgba(74,59,42,0.06)] outline-none transition hover:border-[#cfdcc6] hover:bg-[#fffdf8] focus-visible:ring-3 focus-visible:ring-[#7d916f]/30 sm:rounded-[1.35rem] sm:px-4 sm:py-3"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-semibold leading-5 text-[#3d342d] sm:text-sm">
              ✨ {count} Vibe {count === 1 ? "Check" : "Checks"} waiting
            </span>
            <span className="mt-0.5 block text-[11px] font-semibold leading-4 text-[#667a5e] transition group-hover:text-[#536849] sm:text-xs">
              Start inviting →
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#d8cbbb] bg-[#eef5e8] text-[13px] font-semibold text-[#536849] sm:h-9 sm:w-9 sm:text-sm"
          >
            {count}
          </span>
        </button>
      </div>

      {isOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#2f2a23]/18 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-5 sm:pb-6"
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
            className="w-full max-w-xl animate-in slide-in-from-bottom-6 rounded-[1.75rem] border border-[#e1d6c6] bg-[#fffaf3] p-4 shadow-[0_18px_48px_rgba(47,42,35,0.16)] duration-300 outline-none sm:max-w-2xl sm:p-5"
          >
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-[#d8cbbb]" aria-hidden="true" />

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#d8cbbb] bg-[#eef5e8] text-sm font-semibold text-[#536849]">
                {avatarInitial}
              </div>
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a7c70]">
                  Vibe Check
                </p>
                <h2
                  id="pending-vibe-checks-title"
                  className="mt-1 text-xl font-semibold leading-tight tracking-tight text-[#3d342d] sm:text-2xl"
                >
                  {firstName
                    ? `${firstName} is ready for a Vibe Check`
                    : `${count} ${count === 1 ? "person is" : "people are"} ready for a Vibe Check`}
                </h2>
                <p
                  id="pending-vibe-checks-description"
                  className="mt-2 text-sm leading-6 text-[#6f6258]"
                >
                  You matched. Invite them into a guided conversation before chat
                  unlocks.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close Vibe Checks prompt"
                className="-mr-1 -mt-1 shrink-0 rounded-full text-[#6f6258] hover:bg-[#f3eee5] hover:text-[#3d342d]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 sm:gap-3">
              <Link
                href={primaryScheduleHref}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 w-full rounded-xl bg-[#75886b] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(83,104,73,0.18)] hover:bg-[#697b60] focus-visible:ring-[#7d916f]/30",
                )}
              >
                Choose a time
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setIsOpen(false)}
                className="h-11 w-full rounded-xl text-[#6f6258] hover:bg-[#f3eee5] hover:text-[#3d342d]"
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
