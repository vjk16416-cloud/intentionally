"use server";

import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createDailyRoom } from "@/lib/daily/rooms";
import { type Intention } from "@/lib/qa/questions";
import { selectThreeQuestions } from "@/lib/qa/select";
import { sendQaScheduledEmail } from "@/lib/resend/emails";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { isUserVerified } from "@/lib/verification";

function admin() {
  return createServiceRoleClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

const MIN_LEAD_MINUTES = 10;
const MAX_LEAD_DAYS = 14;

export type ProposeState = { error?: string };
export type ConfirmState = { error?: string };

type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
  status: string;
};

type ExistingSession = {
  id: string;
  scheduled_at: string;
  proposed_by_id: string;
  confirmed_at: string | null;
};

type ParticipantProfile = {
  id: string;
  display_name: string | null;
  intention: string | null;
};

export async function proposeSlot(
  _prev: ProposeState,
  formData: FormData,
): Promise<ProposeState> {
  const matchId = String(formData.get("matchId") ?? "");
  const dateTimeLocal = String(formData.get("scheduledAt") ?? "");
  if (!matchId) return { error: "Missing match." };
  if (!dateTimeLocal) return { error: "Pick a date and time." };

  const scheduledAt = new Date(dateTimeLocal);
  if (Number.isNaN(scheduledAt.getTime())) {
    return { error: "Invalid date." };
  }
  if (scheduledAt.getTime() < Date.now() + MIN_LEAD_MINUTES * 60_000) {
    return { error: `Pick a time at least ${MIN_LEAD_MINUTES} minutes from now.` };
  }
  if (scheduledAt.getTime() > Date.now() + MAX_LEAD_DAYS * 24 * 60 * 60_000) {
    return { error: `Pick a time within the next ${MAX_LEAD_DAYS} days.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b, status")
    .eq("id", matchId)
    .maybeSingle<MatchRow>();
  if (!match) return { error: "Match not found." };
  if (match.status !== "pending_qa") {
    return { error: "This match isn't in a state to be scheduled." };
  }

  if (!(await isUserVerified(supabase, user.id))) {
    redirect(`/verify?return=/schedule/${matchId}`);
  }

  const a = admin();
  const { data: existing } = await a
    .from("qa_sessions")
    .select("id, proposed_by_id, confirmed_at")
    .eq("match_id", matchId)
    .maybeSingle<{
      id: string;
      proposed_by_id: string;
      confirmed_at: string | null;
    }>();

  if (existing?.confirmed_at) {
    return { error: "This Q&A is already confirmed." };
  }

  const now = new Date().toISOString();

  if (!existing) {
    const { error } = await a.from("qa_sessions").insert({
      match_id: matchId,
      scheduled_at: scheduledAt.toISOString(),
      proposed_at: now,
      proposed_by_id: user.id,
    });
    if (error) return { error: error.message };
  } else if (existing.proposed_by_id === user.id) {
    // Same proposer adjusting their own proposal — refresh the time
    // without touching proposed_by_id.
    const { error } = await a
      .from("qa_sessions")
      .update({
        scheduled_at: scheduledAt.toISOString(),
        proposed_at: now,
      })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    // Counter-proposal — flip the proposer to the current user.
    const { error } = await a
      .from("qa_sessions")
      .update({
        scheduled_at: scheduledAt.toISOString(),
        proposed_at: now,
        proposed_by_id: user.id,
        confirmed_at: null,
      })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  }

  redirect(`/schedule/${matchId}`);
}

export async function confirmSlot(
  _prev: ConfirmState,
  formData: FormData,
): Promise<ConfirmState> {
  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) return { error: "Missing match." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b, status")
    .eq("id", matchId)
    .maybeSingle<MatchRow>();
  if (!match) return { error: "Match not found." };
  if (match.status !== "pending_qa") {
    return { error: "This match isn't in a state to be scheduled." };
  }

  if (!(await isUserVerified(supabase, user.id))) {
    redirect(`/verify?return=/schedule/${matchId}`);
  }

  const { data: existing } = await supabase
    .from("qa_sessions")
    .select("id, scheduled_at, proposed_by_id, confirmed_at")
    .eq("match_id", matchId)
    .maybeSingle<ExistingSession>();
  if (!existing) return { error: "No proposal to confirm." };
  if (existing.confirmed_at) return { error: "Already confirmed." };
  if (existing.proposed_by_id === user.id) {
    return {
      error: "You proposed this — wait for the other side to confirm.",
    };
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, intention")
    .in("id", [match.user_a, match.user_b])
    .returns<ParticipantProfile[]>();
  if (!profiles || profiles.length < 2) {
    return { error: "Couldn't load profiles." };
  }
  const intentions: Intention[] = profiles
    .map((p) => p.intention)
    .filter((i): i is Intention => i !== null) as Intention[];
  if (intentions.length === 0) {
    return { error: "Couldn't determine intentions." };
  }

  let room: { name: string; url: string };
  try {
    room = await createDailyRoom(new Date(existing.scheduled_at));
  } catch (err) {
    console.error("[schedule] daily.co room creation failed", err);
    return { error: "Couldn't reserve the video room. Try again in a moment." };
  }

  const questions = selectThreeQuestions(intentions).map((q) => ({
    id: q.id,
    text: q.text,
  }));

  const a = admin();
  const { data: updated, error: updateErr } = await a
    .from("qa_sessions")
    .update({
      confirmed_at: new Date().toISOString(),
      daily_room_url: room.url,
      daily_room_name: room.name,
      questions,
    })
    .eq("id", existing.id)
    .select("id")
    .maybeSingle();
  if (updateErr || !updated) {
    console.error("[schedule] qa_sessions confirm update failed", updateErr);
    return { error: "Couldn't confirm the session." };
  }

  const { error: matchErr } = await a
    .from("matches")
    .update({ status: "qa_scheduled" })
    .eq("id", matchId);
  if (matchErr) {
    console.error("[schedule] matches.status update failed", matchErr);
    // Best effort — the qa_session is confirmed; the user can proceed
    // even if the match status didn't flip cleanly.
  }

  // Best-effort email to both participants. Phone-OTP users won't
  // have an email on auth.users, in which case we silently skip;
  // they'll see the same details in-app at /qa/[sessionId].
  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const thisDisplayName =
    profiles.find((p) => p.id === user.id)?.display_name ?? "your match";
  const otherDisplayName =
    profiles.find((p) => p.id === otherId)?.display_name ?? "your match";

  try {
    const [thisUser, otherUser] = await Promise.all([
      a.auth.admin.getUserById(user.id),
      a.auth.admin.getUserById(otherId),
    ]);

    const sends: Promise<void>[] = [];
    if (thisUser.data.user?.email) {
      sends.push(
        sendQaScheduledEmail({
          to: thisUser.data.user.email,
          otherName: otherDisplayName,
          scheduledAt: new Date(existing.scheduled_at),
          joinUrl: room.url,
          questions,
        }),
      );
    }
    if (otherUser.data.user?.email) {
      sends.push(
        sendQaScheduledEmail({
          to: otherUser.data.user.email,
          otherName: thisDisplayName,
          scheduledAt: new Date(existing.scheduled_at),
          joinUrl: room.url,
          questions,
        }),
      );
    }
    await Promise.all(sends);
  } catch (err) {
    console.error("[schedule] email send failed", err);
    // Best effort; don't block the user.
  }

  redirect(`/qa/${updated.id}`);
}
