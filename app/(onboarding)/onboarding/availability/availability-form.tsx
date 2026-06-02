"use client";

import { useActionState, useState } from "react";

import { StepNav } from "@/components/onboarding/step-nav";
import {
  DAYS_OF_WEEK,
  DISPLAY_HOUR_END,
  DISPLAY_HOUR_START,
  formatHourLabel,
  hourSlots,
  MIN_SLOTS,
} from "@/lib/onboarding/availability";
import { cn } from "@/lib/utils";

import { saveAvailability, type AvailabilityActionState } from "./actions";

const INITIAL_STATE: AvailabilityActionState = {};

const HOURS = Array.from(
  { length: DISPLAY_HOUR_END - DISPLAY_HOUR_START },
  (_, i) => DISPLAY_HOUR_START + i,
);

export function AvailabilityForm({
  initialSlots,
  returnTo,
  previousStep,
}: {
  initialSlots: number[];
  returnTo: string | null;
  previousStep: string | null;
}) {
  // Set<number> of slot indices currently selected. Whole-hour cells
  // toggle the pair of half-hour indices that compose the hour, so
  // selection is always done in matched pairs at the UI level.
  const [slots, setSlots] = useState<Set<number>>(() => new Set(initialSlots));
  const [state, action, pending] = useActionState(
    saveAvailability,
    INITIAL_STATE,
  );

  function toggleHour(dayIndex: number, hour: number) {
    const [s1, s2] = hourSlots(dayIndex, hour);
    setSlots((prev) => {
      const next = new Set(prev);
      const hadHour = next.has(s1) && next.has(s2);
      if (hadHour) {
        next.delete(s1);
        next.delete(s2);
      } else {
        next.add(s1);
        next.add(s2);
      }
      return next;
    });
  }

  const selectedHours = Math.floor(slots.size / 2);
  const ready = slots.size >= MIN_SLOTS;

  return (
    <form action={action} className="space-y-4">
      <input
        type="hidden"
        name="slots"
        value={JSON.stringify(Array.from(slots))}
      />

      <div className="grid grid-cols-[auto_repeat(7,minmax(0,1fr))] gap-1 text-xs">
        <div />
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="pb-1 text-center font-medium">
            {day}
          </div>
        ))}
        {HOURS.flatMap((hour) => [
          <div
            key={`label-${hour}`}
            className="self-center pr-2 text-right text-muted-foreground"
          >
            {formatHourLabel(hour)}
          </div>,
          ...DAYS_OF_WEEK.map((day, dayIndex) => {
            const [s1, s2] = hourSlots(dayIndex, hour);
            const selected = slots.has(s1) && slots.has(s2);
            return (
              <button
                key={`cell-${day}-${hour}`}
                type="button"
                onClick={() => toggleHour(dayIndex, hour)}
                className={cn(
                  "h-6 rounded border transition-colors",
                  selected
                    ? "border-foreground bg-foreground"
                    : "border-border hover:bg-muted",
                )}
                aria-pressed={selected}
                aria-label={`${day} ${formatHourLabel(hour)}`}
              />
            );
          }),
        ])}
      </div>

      <p className="text-xs text-muted-foreground">
        {selectedHours} {selectedHours === 1 ? "hour" : "hours"} selected — at
        least {MIN_SLOTS / 2} required.
      </p>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
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
