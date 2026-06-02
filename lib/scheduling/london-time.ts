// London-time helpers. We compute slot timing in Europe/London via
// Intl.DateTimeFormat rather than trusting the server's TZ env var
// — production deploys (Vercel) default to UTC, and we'd rather not
// have date math silently break the moment someone forgets to set
// the TZ. All math here is DST-aware via the OS's tzdata.
//
// Known limitation: clocks during the 1-hour DST "fall back" window
// exist twice and during "spring forward" exist not at all. We don't
// handle these ambiguities — booking into a DST transition is rare
// enough that the corner case can wait.

import { DAYS_OF_WEEK } from "@/lib/onboarding/availability";

// Get the weekday-of-now in our 0=Mon..6=Sun index (matches the
// slot-index encoding in lib/onboarding/availability).
export function currentLondonDayIndex(now: Date = new Date()): number {
  const weekdayShort = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
  }).format(now);
  const idx = DAYS_OF_WEEK.indexOf(
    weekdayShort as (typeof DAYS_OF_WEEK)[number],
  );
  if (idx < 0) {
    throw new Error(`Unexpected weekday string from Intl: ${weekdayShort}`);
  }
  return idx;
}

// Hour (0-23) and minute (0-59) of the current instant in London.
export function currentLondonTime(now: Date = new Date()): {
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const lookup = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return { hour: lookup("hour"), minute: lookup("minute") };
}

// Year, month (1-12), day of the current instant in London.
export function currentLondonDateParts(now: Date = new Date()): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const lookup = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");
  return {
    year: lookup("year"),
    month: lookup("month"),
    day: lookup("day"),
  };
}

// Convert London-clock components to the UTC instant they represent.
// month is 1-12. Day overflow is normalised by Date.UTC (day=32 in
// January → February 1st, etc.).
//
// Strategy: take the naive UTC of those components, then check how
// that instant formats in London. The difference is the offset to
// subtract. DST-aware because formatToParts uses the OS tzdata.
export function londonClockToUtc({
  year,
  month,
  day,
  hour,
  minute,
}: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}): Date {
  const naive = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  const londonParts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(naive);
  const get = (type: string) =>
    Number(londonParts.find((p) => p.type === type)?.value ?? "0");
  const londonAsIfUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  const offsetMs = londonAsIfUtc - naive.getTime();
  return new Date(naive.getTime() - offsetMs);
}
