-- Reminder-sent timestamps on qa_sessions for the 5b.4 cron jobs.
--
-- Two timestamptz columns, both nullable. The /api/cron/qa-reminders
-- route uses these as idempotency markers:
--
-- - SELECT … WHERE reminder_X_sent_at IS NULL AND <window>
-- - send the email
-- - UPDATE … SET reminder_X_sent_at = now()
--
-- Two separate columns (rather than a single jsonb or text[]) keep
-- the cron's WHERE clause one line and let each reminder kind be
-- tracked independently. Volume at MVP scale doesn't justify an
-- index yet.

alter table public.qa_sessions
  add column reminder_morning_of_sent_at timestamptz,
  add column reminder_hour_before_sent_at timestamptz;
