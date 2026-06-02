import { decodeSlot } from "@/lib/onboarding/availability";

import {
  currentLondonDateParts,
  currentLondonDayIndex,
  currentLondonTime,
  londonClockToUtc,
} from "./london-time";

const MIN_LEAD_MINUTES = 10;
const DEFAULT_LIMIT = 3;

export type SlotProposal = {
  slotIndex: number;
  scheduledAtIso: string;
};

// Compute up to N mutual future slots, sorted soonest-first (the
// §6.4 refinement #1 bias: prefer near-term over far-future — no
// extra "in 24-48h" filtering required; soonest-first naturally
// surfaces those slots when they exist).
//
// IMPORTANT — slot membership is time-dependent. The next-occurrence
// of a weekly slot may be ≤ MIN_LEAD_MINUTES away on one page render
// (so it gets dropped) and then "tomorrow" on the next render — the
// "vanished slot" between page loads isn't a bug, it's the cutoff
// moving. Same applies as today-passed slots roll forward to next
// week across the midnight boundary. Testers shouldn't be surprised
// when refreshing the picker reorders or drops options as time
// passes.
//
// `excludeScheduledAtIso` lets the counter-proposal UI hide the
// timestamp the other user already proposed, so the cards never
// offer "the same time" as a counter (which would just be a confirm
// in disguise).
export function computeMutualSlots(
  availabilityA: readonly number[],
  availabilityB: readonly number[],
  options: {
    now?: Date;
    limit?: number;
    excludeScheduledAtIso?: string;
  } = {},
): SlotProposal[] {
  const now = options.now ?? new Date();
  const limit = options.limit ?? DEFAULT_LIMIT;
  const exclude = options.excludeScheduledAtIso;

  const aSet = new Set(availabilityA);
  const mutualSlots: number[] = [];
  for (const slot of availabilityB) {
    if (aSet.has(slot)) mutualSlots.push(slot);
  }
  if (mutualSlots.length === 0) return [];

  const cutoffMs = now.getTime() + MIN_LEAD_MINUTES * 60_000;
  const proposals: SlotProposal[] = [];
  for (const slotIndex of mutualSlots) {
    const dt = nextOccurrence(slotIndex, now);
    if (dt.getTime() < cutoffMs) continue;
    proposals.push({
      slotIndex,
      scheduledAtIso: dt.toISOString(),
    });
  }

  proposals.sort((a, b) =>
    a.scheduledAtIso.localeCompare(b.scheduledAtIso),
  );

  const filtered = exclude
    ? proposals.filter((p) => p.scheduledAtIso !== exclude)
    : proposals;

  return filtered.slice(0, limit);
}

// Map a weekly slot index to the next concrete London-time
// occurrence. Day index is 0=Mon..6=Sun matching the slot encoding.
function nextOccurrence(slotIndex: number, now: Date): Date {
  const { day: targetDay, halfHour } = decodeSlot(slotIndex);
  const targetHour = Math.floor(halfHour / 2);
  const targetMinute = (halfHour % 2) * 30;

  const currentDay = currentLondonDayIndex(now);
  const { hour: nowHour, minute: nowMinute } = currentLondonTime(now);
  const { year, month, day } = currentLondonDateParts(now);

  let daysAhead = (targetDay - currentDay + 7) % 7;
  if (daysAhead === 0) {
    const slotMinutes = targetHour * 60 + targetMinute;
    const nowMinutes = nowHour * 60 + nowMinute;
    if (slotMinutes <= nowMinutes) {
      // Slot exists today but the time has already passed — roll to
      // next week's occurrence.
      daysAhead = 7;
    }
  }

  return londonClockToUtc({
    year,
    month,
    day: day + daysAhead,
    hour: targetHour,
    minute: targetMinute,
  });
}
