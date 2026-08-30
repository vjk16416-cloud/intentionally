const HOUR_BEFORE_LOWER_MS = 45 * 60_000;
const HOUR_BEFORE_UPPER_MS = 60 * 60_000;

type QaHourBeforeReminderInput = {
  now: Date;
  scheduledAt: Date;
  reminderSentAt: string | null;
};

export function isQaHourBeforeReminderDue({
  now,
  scheduledAt,
  reminderSentAt,
}: QaHourBeforeReminderInput): boolean {
  if (reminderSentAt !== null) return false;

  const msUntilStart = scheduledAt.getTime() - now.getTime();

  return (
    msUntilStart > HOUR_BEFORE_LOWER_MS &&
    msUntilStart <= HOUR_BEFORE_UPPER_MS
  );
}
