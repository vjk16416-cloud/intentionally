import "server-only";

import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { appUrlForPath } from "@/lib/app-url";
import { authoriseCron } from "@/lib/cron/auth";
import {
  sendQaMorningOfEmail,
  sendQaOneHourBeforeEmail,
} from "@/lib/resend/emails";
import {
  currentLondonDateParts,
  currentLondonTime,
} from "@/lib/scheduling/london-time";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";

export const runtime = "nodejs";

// Reminder cron — runs every 15 minutes (vercel.json). Fires two
// kinds of reminder per confirmed qa_session:
//
// - Morning-of: any 15-min tick when London time is between 08:00
//   and 09:00 AND the scheduled_at is later the same London
//   calendar day. Light "today's the day" note, no questions.
// - One-hour-before: any tick when 45 min < scheduled_at - now ≤
//   60 min. Repeats the three questions for last-minute prep.
//
// Idempotency: each kind has its own timestamp column on
// qa_sessions; the WHERE filter (IS NULL) prevents duplicate fires.
// We stamp the timestamp regardless of per-recipient email outcome
// (per Q5 of the plan) — retrying on transient send failures would
// risk spamming the recipient.
//
// Phone-OTP users with no email on auth.users.email are silently
// skipped. The same caveat applies to qa-scheduled today.

const MORNING_HOUR_START = 8;
const MORNING_HOUR_END = 9;

const HOUR_BEFORE_LOWER_MS = 45 * 60_000;
const HOUR_BEFORE_UPPER_MS = 60 * 60_000;

function admin() {
  return createServiceRoleClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

type SessionRow = {
  id: string;
  match_id: string;
  scheduled_at: string;
  questions: { id: string; text: string }[] | null;
  reminder_morning_of_sent_at: string | null;
  reminder_hour_before_sent_at: string | null;
};

type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

export async function GET(request: Request) {
  if (!authoriseCron(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = admin();
  const now = new Date();
  const nowMs = now.getTime();

  const { data: sessions, error: sessionsError } = await supabase
    .from("qa_sessions")
    .select(
      "id, match_id, scheduled_at, questions, reminder_morning_of_sent_at, reminder_hour_before_sent_at",
    )
    .eq("status", "scheduled")
    .not("confirmed_at", "is", null)
    .returns<SessionRow[]>();

  if (sessionsError) {
    console.error("[cron/qa-reminders] sessions query failed", sessionsError);
    return new NextResponse("Database error", { status: 500 });
  }
  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ morning: 0, hourBefore: 0 });
  }

  let morningCount = 0;
  let hourBeforeCount = 0;

  for (const session of sessions) {
    const scheduledAt = new Date(session.scheduled_at);
    const msUntilStart = scheduledAt.getTime() - nowMs;

    const shouldSendMorning =
      session.reminder_morning_of_sent_at === null &&
      isInMorningWindow(now) &&
      isSameLondonDay(now, scheduledAt) &&
      msUntilStart > 0;

    const shouldSendHourBefore =
      session.reminder_hour_before_sent_at === null &&
      msUntilStart > HOUR_BEFORE_LOWER_MS &&
      msUntilStart <= HOUR_BEFORE_UPPER_MS;

    if (!shouldSendMorning && !shouldSendHourBefore) continue;

    const { data: match } = await supabase
      .from("matches")
      .select("id, user_a, user_b")
      .eq("id", session.match_id)
      .maybeSingle<MatchRow>();
    if (!match) continue;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", [match.user_a, match.user_b])
      .returns<ProfileRow[]>();
    if (!profiles || profiles.length < 2) continue;

    const profileA = profiles.find((p) => p.id === match.user_a);
    const profileB = profiles.find((p) => p.id === match.user_b);
    if (!profileA || !profileB) continue;

    const [userA, userB] = await Promise.all([
      supabase.auth.admin.getUserById(match.user_a),
      supabase.auth.admin.getUserById(match.user_b),
    ]);
    const emailA = userA.data.user?.email ?? null;
    const emailB = userB.data.user?.email ?? null;
    const joinUrl = appUrlForPath(`/qa/${session.id}`);

    if (shouldSendMorning) {
      const sends: Promise<void>[] = [];
      if (emailA && profileB.display_name) {
        sends.push(
          sendQaMorningOfEmail({
            to: emailA,
            otherName: profileB.display_name,
            scheduledAt,
            joinUrl,
          }).catch((err) => {
            console.error(
              "[cron/qa-reminders] morning-of send to A failed",
              err,
            );
          }),
        );
      }
      if (emailB && profileA.display_name) {
        sends.push(
          sendQaMorningOfEmail({
            to: emailB,
            otherName: profileA.display_name,
            scheduledAt,
            joinUrl,
          }).catch((err) => {
            console.error(
              "[cron/qa-reminders] morning-of send to B failed",
              err,
            );
          }),
        );
      }
      await Promise.all(sends);
      await supabase
        .from("qa_sessions")
        .update({ reminder_morning_of_sent_at: now.toISOString() })
        .eq("id", session.id);
      morningCount += 1;
    }

    if (shouldSendHourBefore) {
      const questions = session.questions ?? [];
      const sends: Promise<void>[] = [];
      if (emailA && profileB.display_name) {
        sends.push(
          sendQaOneHourBeforeEmail({
            to: emailA,
            otherName: profileB.display_name,
            scheduledAt,
            joinUrl,
            questions,
          }).catch((err) => {
            console.error(
              "[cron/qa-reminders] hour-before send to A failed",
              err,
            );
          }),
        );
      }
      if (emailB && profileA.display_name) {
        sends.push(
          sendQaOneHourBeforeEmail({
            to: emailB,
            otherName: profileA.display_name,
            scheduledAt,
            joinUrl,
            questions,
          }).catch((err) => {
            console.error(
              "[cron/qa-reminders] hour-before send to B failed",
              err,
            );
          }),
        );
      }
      await Promise.all(sends);
      await supabase
        .from("qa_sessions")
        .update({ reminder_hour_before_sent_at: now.toISOString() })
        .eq("id", session.id);
      hourBeforeCount += 1;
    }
  }

  return NextResponse.json({
    morning: morningCount,
    hourBefore: hourBeforeCount,
  });
}

function isInMorningWindow(now: Date): boolean {
  const { hour } = currentLondonTime(now);
  return hour >= MORNING_HOUR_START && hour < MORNING_HOUR_END;
}

function isSameLondonDay(a: Date, b: Date): boolean {
  const aParts = currentLondonDateParts(a);
  const bParts = currentLondonDateParts(b);
  return (
    aParts.year === bParts.year &&
    aParts.month === bParts.month &&
    aParts.day === bParts.day
  );
}
