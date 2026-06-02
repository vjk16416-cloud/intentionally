// Helpers for the weekly-availability data on profiles.
//
// Storage shape (see migration): int[] of slot indices. Each
// index is `dayIndex * 48 + halfHourIndex`, where dayIndex is
// 0..6 (0 = Mon, 6 = Sun) and halfHourIndex is 0..47 (0 = 00:00,
// 47 = 23:30). So Monday 9–11am is [66, 67, 68, 69].
//
// The onboarding UI is hour-level for usability — users tick
// whole-hour cells, each of which selects/unselects the two
// half-hour slots inside the hour. We still store at 30-min
// granularity so the upcoming three-slot picker (5b.2) can land
// on half-hour boundaries.

export const DAYS_OF_WEEK = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export const SLOTS_PER_DAY = 48;
export const TOTAL_SLOTS = 7 * SLOTS_PER_DAY;

// Display window — show 8am to midnight in the grid. Users with
// outside-window availability are rare; we can widen later.
export const DISPLAY_HOUR_START = 8;
export const DISPLAY_HOUR_END = 24;

// Onboarding completeness threshold per Q4 of the plan: at least
// 4 slots (= 2 hours of weekly availability).
export const MIN_SLOTS = 4;

export function slotIndex(dayIndex: number, halfHourIndex: number): number {
  return dayIndex * SLOTS_PER_DAY + halfHourIndex;
}

export function decodeSlot(index: number): { day: number; halfHour: number } {
  return {
    day: Math.floor(index / SLOTS_PER_DAY),
    halfHour: index % SLOTS_PER_DAY,
  };
}

// The two half-hour slot indices that make up a given hour cell.
export function hourSlots(
  dayIndex: number,
  hourOfDay: number,
): [number, number] {
  const halfHour = hourOfDay * 2;
  return [slotIndex(dayIndex, halfHour), slotIndex(dayIndex, halfHour + 1)];
}

export function isValidSlotIndex(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < TOTAL_SLOTS
  );
}

export function formatHourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
}

// Human summary for the review page — e.g.
// "Mon 6pm–11pm; Sat 9am–12pm; Sun 10am–9pm".
//
// We summarise at hour granularity (the UI granularity) even though
// storage is half-hours, so consecutive 30-min runs read as nice
// round hour ranges.
export function summariseAvailability(slots: readonly number[]): string {
  if (slots.length === 0) return "Not set";

  // Group selected hours per day. A half-hour slot counts toward
  // its hour bucket; whole-hour selections produce both halves.
  const hoursByDay = new Map<number, Set<number>>();
  for (const slot of slots) {
    const { day, halfHour } = decodeSlot(slot);
    const hour = Math.floor(halfHour / 2);
    if (!hoursByDay.has(day)) hoursByDay.set(day, new Set());
    hoursByDay.get(day)!.add(hour);
  }

  const parts: string[] = [];
  for (let day = 0; day < 7; day++) {
    const hours = hoursByDay.get(day);
    if (!hours || hours.size === 0) continue;
    const sorted = Array.from(hours).sort((a, b) => a - b);

    // Collapse consecutive hours into ranges (e.g., [18,19,20] → "6pm–9pm").
    const ranges: string[] = [];
    let runStart = sorted[0];
    let runEnd = runStart;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === runEnd + 1) {
        runEnd = sorted[i];
      } else {
        ranges.push(`${formatHourLabel(runStart)}–${formatHourLabel(runEnd + 1)}`);
        runStart = sorted[i];
        runEnd = runStart;
      }
    }
    ranges.push(`${formatHourLabel(runStart)}–${formatHourLabel(runEnd + 1)}`);

    parts.push(`${DAYS_OF_WEEK[day]} ${ranges.join(", ")}`);
  }

  return parts.join("; ");
}
