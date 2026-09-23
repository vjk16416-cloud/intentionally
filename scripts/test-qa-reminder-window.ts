import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { isQaHourBeforeReminderDue } from "../lib/cron/qa-reminder-window";

const now = new Date("2026-08-30T12:00:00.000Z");

function minutesAfterNow(minutes: number, extraMs = 0): Date {
  return new Date(now.getTime() + minutes * 60_000 + extraMs);
}

assert.equal(
  isQaHourBeforeReminderDue({
    now,
    scheduledAt: minutesAfterNow(60),
    reminderSentAt: null,
  }),
  true,
  "a session exactly 60 minutes away should receive the reminder",
);

assert.equal(
  isQaHourBeforeReminderDue({
    now,
    scheduledAt: minutesAfterNow(45, 1),
    reminderSentAt: null,
  }),
  true,
  "a session just over 45 minutes away should receive the reminder",
);

assert.equal(
  isQaHourBeforeReminderDue({
    now,
    scheduledAt: minutesAfterNow(45),
    reminderSentAt: null,
  }),
  false,
  "a session exactly 45 minutes away is outside the safe delivery window",
);

assert.equal(
  isQaHourBeforeReminderDue({
    now,
    scheduledAt: minutesAfterNow(60, 1),
    reminderSentAt: null,
  }),
  false,
  "a session more than 60 minutes away should wait for a later scheduler tick",
);

assert.equal(
  isQaHourBeforeReminderDue({
    now,
    scheduledAt: minutesAfterNow(55),
    reminderSentAt: "2026-08-30T11:05:00.000Z",
  }),
  false,
  "an already-sent reminder must not be sent again",
);

const schedulerSource = readFileSync(
  ".github/workflows/qa-reminder-scheduler.yml",
  "utf8",
);

assert.match(
  schedulerSource,
  /cron:\s*["']7,22,37,52 \* \* \* \*["']/,
  "production reminder scheduler must invoke every 15 minutes away from the hourly peak",
);
assert.match(
  schedulerSource,
  /https:\/\/intentionally-seven\.vercel\.app\/api\/cron\/qa-reminders/,
  "scheduler must call the stable production reminder endpoint",
);
assert.match(
  schedulerSource,
  /id-token:\s*write/,
  "scheduler must request a short-lived GitHub OIDC token",
);
assert.match(
  schedulerSource,
  /ACTIONS_ID_TOKEN_REQUEST_URL/,
  "scheduler must request its token from GitHub Actions",
);
assert.match(
  schedulerSource,
  /ACTIONS_ID_TOKEN_REQUEST_TOKEN/,
  "scheduler must authenticate the OIDC token request with GitHub Actions",
);
assert.match(
  schedulerSource,
  /Authorization:\s*Bearer \$OIDC_TOKEN/,
  "scheduler must send its short-lived OIDC token to the reminder endpoint",
);
assert.doesNotMatch(
  schedulerSource,
  /CRON_SECRET/,
  "scheduler must not store or send a long-lived cron secret",
);
assert.doesNotMatch(
  schedulerSource,
  /mgtqithikswryuoqtwae/,
  "scheduler must not reference the inactive staging Supabase project",
);

console.log("Q&A reminder-window and scheduler regression passed.");
