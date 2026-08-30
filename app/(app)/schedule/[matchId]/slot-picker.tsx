"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { FallbackActionLink, FallbackPanel } from "@/components/fallback-state";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import type { SlotProposal } from "@/lib/scheduling/slots";
import { cn } from "@/lib/utils";

import { proposeSlot, type ProposeState } from "./actions";

const INITIAL_STATE: ProposeState = {};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Europe/London",
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Europe/London",
});

function toAmPm(time: string) {
  return time.replace(" am", "am").replace(" pm", "pm");
}

function inviteErrorCode(error: string) {
  if (/already|confirmed/i.test(error)) return "duplicate";
  if (/slot|date|available/i.test(error)) return "slot_unavailable";
  if (/match/i.test(error)) return "match_state";
  return "failed";
}

export function SlotPicker({
  matchId,
  slots,
}: {
  matchId: string;
  slots: SlotProposal[];
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (slots.length === 0) {
    return (
      <FallbackPanel
        eyebrow="Schedule"
        title="No shared times yet"
        description="There is not enough overlap in the next 7 days. Either of you can add more availability, then try again."
        note="You can update your availability without leaving this flow."
        action={
          <FallbackActionLink href={`/onboarding/availability?return=/schedule/${matchId}`}>
            Edit availability
          </FallbackActionLink>
        }
        className="text-center"
      />
    );
  }

  const selectedSlot = selectedIndex === null ? null : slots[selectedIndex];
  const selectedLabel = selectedSlot
    ? toAmPm(timeFormatter.format(new Date(selectedSlot.scheduledAtIso)))
    : null;

  return (
    <SelectionForm
      matchId={matchId}
      selectedSlot={selectedSlot}
      selectedLabel={selectedLabel}
    >
      <div
        role="radiogroup"
        aria-label="Available times"
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
      >
        {slots.map((slot, index) => {
          const selected = index === selectedIndex;

          return (
            <SlotCard
              key={slot.scheduledAtIso}
              slot={slot}
              selected={selected}
              tag={["Soonest overlap", "Another good time", "Also available"][index] ?? "Option"}
              onSelect={() => setSelectedIndex(index)}
            />
          );
        })}
      </div>
    </SelectionForm>
  );
}

function SelectionForm({
  matchId,
  selectedSlot,
  selectedLabel,
  children,
}: {
  matchId: string;
  selectedSlot: SlotProposal | null;
  selectedLabel: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(proposeSlot, INITIAL_STATE);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hiddenScheduledAt = selectedSlot?.scheduledAtIso ?? "";
  const selectedDateTime = selectedSlot
    ? `${dateFormatter.format(new Date(selectedSlot.scheduledAtIso))} at ${toAmPm(
        timeFormatter.format(new Date(selectedSlot.scheduledAtIso)),
      )}`
    : null;

  useEffect(() => {
    if (!state.error) return;

    const errorCode = inviteErrorCode(state.error);
    trackAnalyticsEvent("qaInviteFailed", {
      properties: {
        match_id: matchId,
        error_code: errorCode,
      },
    });

    if (errorCode === "duplicate") {
      trackAnalyticsEvent("qaInviteDuplicate", {
        properties: { match_id: matchId },
      });
    }
  }, [matchId, state.error]);

  useEffect(() => {
    if (!state.success) return;
    setIsConfirmOpen(false);
    router.refresh();
  }, [router, state.success]);

  useEffect(() => {
    if (!isConfirmOpen) return;

    const trigger = triggerRef.current;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsConfirmOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [isConfirmOpen]);

  function openConfirmation() {
    if (!selectedSlot || pending) return;

    trackAnalyticsEvent("qaInviteConfirmationOpened", {
      properties: {
        match_id: matchId,
        scheduled_at: selectedSlot.scheduledAtIso,
        source: "slot_picker",
      },
    });
    setIsConfirmOpen(true);
  }

  return (
    <div className="space-y-4">
      {children}
      <form action={action} className="space-y-3">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="scheduledAt" value={hiddenScheduledAt} />
        <button
          ref={triggerRef}
          type="button"
          disabled={pending || !selectedSlot}
          onClick={openConfirmation}
          className="w-full rounded-2xl bg-[#75886b] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(83,104,73,0.24)] transition hover:bg-[#697b60] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Sending invite..."
            : selectedLabel
              ? "Invite to Q&A"
              : "Select a time to invite"}
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          They can accept or suggest another time. Chat stays locked until the
          Q&amp;A is complete and you both privately choose Continue.
        </p>
        {pending ? (
          <p className="text-center text-xs font-medium text-muted-foreground">
            Sending invite…
          </p>
        ) : null}
        {state.error ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        {isConfirmOpen && selectedSlot ? (
          <div
            role="presentation"
            className="fixed inset-0 z-[70] flex items-end justify-center bg-[#2f2a23]/28 px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6 sm:items-center sm:px-5 sm:pb-6"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsConfirmOpen(false);
            }}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="qa-invite-confirm-title"
              aria-describedby="qa-invite-confirm-description"
              tabIndex={-1}
              className="w-full max-w-md rounded-[1.75rem] border border-[#e1d6c6] bg-[#fffaf3] p-5 shadow-[0_24px_70px_rgba(47,42,35,0.20)] outline-none sm:p-6"
            >
              <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-[#d8cbbb]" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7c70]">
                Q&amp;A invite
              </p>
              <h3
                id="qa-invite-confirm-title"
                className="mt-2 text-2xl font-semibold tracking-tight text-[#3d342d]"
              >
                Send this Q&amp;A invite?
              </h3>
              <p
                id="qa-invite-confirm-description"
                className="mt-3 text-sm leading-6 text-[#6f6258]"
              >
                You are proposing {selectedDateTime}. They can accept this time
                or suggest another one.
              </p>

              <div className="mt-4 rounded-2xl border border-[#dfe7d9] bg-[#eef5e8] px-4 py-3 text-sm leading-6 text-[#5f6f57]">
                Chat unlocks only if you both privately choose Continue after
                the Q&amp;A.
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="submit"
                  disabled={pending}
                  onClick={() => {
                    trackAnalyticsEvent("qaInviteSubmitted", {
                      properties: {
                        match_id: matchId,
                        scheduled_at: selectedSlot.scheduledAtIso,
                        source: "slot_picker_confirmation",
                      },
                    });
                    trackAnalyticsEvent("scheduleClicked", {
                      properties: {
                        match_id: matchId,
                        scheduled_at: selectedSlot.scheduledAtIso,
                        source: "slot_picker_confirmation",
                      },
                    });
                  }}
                  className="h-12 w-full rounded-2xl bg-[#75886b] px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(83,104,73,0.24)] transition hover:bg-[#697b60] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Sending invite..." : "Send invite"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setIsConfirmOpen(false)}
                  className="h-11 w-full rounded-xl px-4 text-sm font-semibold text-[#6f6258] transition hover:bg-[#f3eee5] hover:text-[#3d342d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}

function SlotCard({
  slot,
  selected,
  tag,
  onSelect,
}: {
  slot: SlotProposal;
  selected: boolean;
  tag: string;
  onSelect: () => void;
}) {
  const dt = new Date(slot.scheduledAtIso);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group w-full rounded-[1.5rem] border p-4 text-left shadow-[0_10px_28px_rgba(74,59,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(74,59,42,0.09)]",
        selected
          ? "border-[#7b8b72] bg-[#f3f7ef] shadow-[0_14px_34px_rgba(83,104,73,0.12)]"
          : "border-[#e6ded0] bg-[#fffdf8]",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
            selected
              ? "border-[#75886b] bg-[#75886b]"
              : "border-[#cfd8c6] bg-[#f3f7ef]",
          )}
        >
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full transition",
              selected ? "bg-[#fffdf8]" : "bg-[#75886b]",
            )}
          />
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-semibold leading-5 text-foreground">
              {dateFormatter.format(dt)}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                selected
                  ? "border-[#d7e2ce] bg-[#eef2e8] text-[#536849]"
                  : "border-[#dfe7da] bg-[#eef2e8] text-[#5d6c55]",
              )}
            >
              {selected ? "Selected" : tag}
            </span>
          </div>
          <p className="text-sm leading-5 text-muted-foreground">
            {timeFormatter.format(dt)}
          </p>
          <p className="text-xs leading-5 text-muted-foreground/90">
            {selected ? "Ready to invite." : "Tap to select this time."}
          </p>
        </div>
      </div>
    </button>
  );
}
