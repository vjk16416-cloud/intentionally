"use client";

import { useActionState, useState, type ReactNode } from "react";

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
        title="No mutual times in the next 7 days"
        description="One of you needs to widen availability. Either of you can do that, then try again."
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
              tag={["Best match", "Great option", "Also good"][index] ?? "Option"}
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
  const [state, action, pending] = useActionState(proposeSlot, INITIAL_STATE);
  const hiddenScheduledAt = selectedSlot?.scheduledAtIso ?? "";

  return (
    <div className="space-y-4">
      {children}
      <form action={action} className="space-y-3">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="scheduledAt" value={hiddenScheduledAt} />
        <button
          type="submit"
          disabled={pending || !selectedSlot}
          onClick={() => {
            if (!selectedSlot) return;
            trackAnalyticsEvent("scheduleClicked", {
              properties: {
                match_id: matchId,
                scheduled_at: selectedSlot.scheduledAtIso,
                source: "slot_picker",
              },
            });
          }}
          className="w-full rounded-2xl bg-[#75886b] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(83,104,73,0.24)] transition hover:bg-[#697b60] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending
            ? "Sending invite..."
            : selectedLabel
              ? `Continue with ${selectedLabel}`
              : "Select a time to continue"}
        </button>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          They&apos;ll receive your invite and can accept or suggest another
          time.
        </p>
        {pending ? (
          <p className="text-center text-xs font-medium text-muted-foreground">
            Sending invite…
          </p>
        ) : null}
        {state.error ? (
          <p className="text-center text-xs text-destructive">{state.error}</p>
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
            {selected ? "Ready to continue." : "Tap to select this time."}
          </p>
        </div>
      </div>
    </button>
  );
}
