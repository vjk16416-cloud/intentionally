"use server";

import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type Decision = "continue" | "pass";

type QaSession = {
  id: string;
  match_id: string;
  status: "scheduled" | "in_progress" | "completed" | "no_show" | "cancelled";
  confirmed_at: string | null;
};

function admin() {
  return createServiceRoleClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

async function getParticipantSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("qa_sessions")
    .select("id, match_id, status, confirmed_at")
    .eq("id", sessionId)
    .maybeSingle<QaSession>();
  if (!session) redirect("/discover");

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("id", session.match_id)
    .maybeSingle();
  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    redirect("/discover");
  }

  return session;
}

export async function startQaSession(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) redirect("/discover");

  const session = await getParticipantSession(sessionId);
  if (!session.confirmed_at) redirect(`/schedule/${session.match_id}`);

  if (session.status === "scheduled") {
    const { error } = await admin()
      .from("qa_sessions")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", session.id)
      .eq("status", "scheduled");

    if (error) {
      console.error("[qa] session start failed", error);
      redirect(`/qa/${sessionId}/visibility`);
    }
  }

  if (session.status !== "scheduled" && session.status !== "in_progress") {
    redirect(`/qa/${sessionId}`);
  }

  redirect(`/qa/${sessionId}`);
}

export async function completeQaSession(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  if (!sessionId) redirect("/discover");

  const session = await getParticipantSession(sessionId);
  if (session.status !== "in_progress") redirect(`/qa/${sessionId}`);

  const { error } = await admin()
    .from("qa_sessions")
    .update({ status: "completed", ended_at: new Date().toISOString() })
    .eq("id", session.id)
    .eq("status", "in_progress");

  if (error) {
    console.error("[qa] session completion failed", error);
    redirect(`/qa/${sessionId}`);
  }

  redirect(`/qa/${sessionId}`);
}

export async function saveQaOutcome(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  const decision = String(formData.get("decision") ?? "") as Decision;

  if (!sessionId || !["continue", "pass"].includes(decision)) {
    redirect("/discover");
  }

  const session = await getParticipantSession(sessionId);
  if (session.status !== "completed") redirect(`/qa/${sessionId}`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await admin().from("qa_outcomes").upsert(
    {
      qa_session_id: sessionId,
      user_id: user.id,
      decision,
    },
    { onConflict: "qa_session_id,user_id" },
  );

  if (error) {
    console.error("[qa] outcome save failed", error);
    redirect(`/qa/${sessionId}`);
  }

  redirect(`/qa/${sessionId}/waiting`);
}
