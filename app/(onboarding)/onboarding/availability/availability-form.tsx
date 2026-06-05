"use client";

import { useActionState, useState } from "react";

import { StepNav } from "@/components/onboarding/step-nav";
import {
  DAYS_OF_WEEK,
  MIN_SLOTS,
  hourSlots,
  summariseAvailability,
} from "@/lib/onboarding/availability";
import { cn } from "@/lib/utils";

import { saveAvailability, type AvailabilityActionState } from "./actions";

const INITIAL_STATE: AvailabilityActionState = {};

const TIME_BLOCKS = [
  {
    label: "Morning",
    helper: "8am–12pm",
    hours: [8, 9, 10, 11],
  },
  {
    label: "Afternoon",
    helper: "12pm–5pm",
    hours: [12, 13, 14, 15, 16],
  },
  {
    label: "Evening",
    helper: "5pm–9pm",
    hours: [17, 18, 19, 20],
  },
  {
    label: "Night",
    helper: "9pm–12am",
    hours: [21, 22, 23],
  },
] as const;

const QUICK_PICKS = [
  {
    label: "Weekday evenings",
    helper: "Mon–Thu",
    days: [0, 1, 2, 3],
    hours: [18, 19, 20],
  },
  {
    label: "Weekend daytime",
    helper: "Sat–Sun",
    days: [5, 6],
    hours: [11, 12, 13, 14, 15],
  },
  {
    label: "Sunday reset",
    helper: "Sunday",
    days: [6],
    hours: [17, 18, 19, 20],
  },
] as const;

export function AvailabilityForm({
  initialSlots,
  returnTo,
  previousStep,
}: {
  initialSlots: number[];
  returnTo: string | null;
  previousStep: string | null;
}) {
  const [slots, setSlots] = useState<Set<number>>(() => new Set(initialSlots));
  const [activeDay, setActiveDay] = useState(0);

  const [state, action, pending] = useActionState(
    saveAvailability,
    INITIAL_STATE,
  );

  function addHours(dayIndex: number, hours: readonly number[]) {
    setSlots((prev) => {
      const next = new Set(prev);

      for (const hour of hours) {
        const [s1, s2] = hourSlots(dayIndex, hour);
        next.add(s1);
        next.add(s2);
      }

      return next;
    });
  }

  function removeHours(dayIndex: number, hours: readonly number[]) {
    setSlots((prev) => {
      const next = new Set(prev);

      for (const hour of hours) {
        const [s1, s2] = hourSlots(dayIndex, hour);
        next.delete(s1);
        next.delete(s2);
      }

      return next;
    });
  }

  function blockIsSelected(dayIndex: number, hours: readonly number[]) {
    return hours.every((hour) => {
      const [s1, s2] = hourSlots(dayIndex, hour);
      return slots.has(s1) && slots.has(s2);
    });
  }

  function toggleBlock(dayIndex: number, hours: readonly number[]) {
    if (blockIsSelected(dayIndex, hours)) {
      removeHours(dayIndex, hours);
    } else {
      addHours(dayIndex, hours);
    }
  }

  function applyQuickPick(pick: (typeof QUICK_PICKS)[number]) {
    setSlots((prev) => {
      const next = new Set(prev);

      for (const day of pick.days) {
        for (const hour of pick.hours) {
          const [s1, s2] = hourSlots(day, hour);
          next.add(s1);
          next.add(s2);
        }
      }

      return next;
    });
  }

  function clearSelection() {
    setSlots(new Set());
  }

  function selectedHourCountForDay(dayIndex: number) {
    let count = 0;

    for (const block of TIME_BLOCKS) {
      for (const hour of block.hours) {
        const [s1, s2] = hourSlots(dayIndex, hour);
        if (slots.has(s1) && slots.has(s2)) count += 1;
      }
    }

    return count;
  }

  const selectedHours = Math.floor(slots.size / 2);
  const ready = slots.size >= MIN_SLOTS;
  const summary = summariseAvailability(Array.from(slots));

  return (
    <form action={action} className="space-y-4">
      <input
        type="hidden"
        name="slots"
        value={JSON.stringify(Array.from(slots))}
      />


      <div
        className={cn(
          "rounded-3xl border px-4 py-3",
          ready
            ? "border-foreground bg-foreground text-background"
            : "border-input bg-muted/20",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">
              {ready ? "Ready to continue" : "Pick at least 2 hours"}
            </p>
            <p
              className={cn(
                "mt-0.5 text-xs",
                ready ? "text-background/75" : "text-muted-foreground",
              )}
            >
              {selectedHours} {selectedHours === 1 ? "hour" : "hours"} selected
            </p>
          </div>

          {selectedHours > 0 ? (
            <button
              type="button"
              onClick={clearSelection}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium underline underline-offset-4",
                ready ? "text-background" : "text-foreground",
              )}
            >
              Clear
            </button>
          ) : null}
        </div>

        {selectedHours > 0 ? (
          <p
            className={cn(
              "mt-2 line-clamp-2 text-xs leading-5",
              ready ? "text-background/75" : "text-muted-foreground",
            )}
          >
            {summary}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Quick picks</p>
          <p className="text-xs text-muted-foreground">Optional shortcuts</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {QUICK_PICKS.map((pick) => (
            <button
              key={pick.label}
              type="button"
              onClick={() => applyQuickPick(pick)}
              className="rounded-2xl border border-input bg-background px-3 py-2 text-left transition hover:bg-muted"
            >
              <span className="block text-xs font-semibold">{pick.label}</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                {pick.helper}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold">Choose by day</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Select a day, then tap your usual free time.
          </p>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS_OF_WEEK.map((day, index) => {
            const active = activeDay === index;
            const count = selectedHourCountForDay(index);

            return (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(index)}
                className={cn(
                  "rounded-2xl border px-1 py-2 text-center text-xs transition",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-input bg-background hover:bg-muted",
                )}
              >
                <span className="block font-semibold">{day}</span>
                <span
                  className={cn(
                    "mt-0.5 block text-[10px]",
                    active ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  {count > 0 ? `${count}h` : "—"}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {TIME_BLOCKS.map((block) => {
            const selected = blockIsSelected(activeDay, block.hours);

            return (
              <button
                key={block.label}
                type="button"
                onClick={() => toggleBlock(activeDay, block.hours)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  selected
                    ? "border-foreground bg-foreground text-background shadow-sm"
                    : "border-input bg-background hover:bg-muted",
                )}
              >
                <span className="block text-sm font-semibold">
                  {block.label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs",
                    selected ? "text-background/70" : "text-muted-foreground",
                  )}
                >
                  {block.helper}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-input bg-muted/20 px-4 py-3">
        <p className="text-sm font-semibold">Why we ask</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          This helps schedule Q&A sessions smoothly and avoid dead matches.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <StepNav
        returnTo={returnTo}
        previousStep={previousStep}
        pending={pending}
        disabled={!ready}
      />
    </form>
  );
}