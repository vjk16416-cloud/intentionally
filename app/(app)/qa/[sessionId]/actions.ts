"use server";

import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

type Decision = "continue" | "pass";

function admin() {
  return createServiceRoleClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

export async function saveQaOutcome(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  const decision = String(formData.get("decision") ?? "") as Decision;

  if (!sessionId || !["continue", "pass"].includes(decision)) {
    redirect("/discover");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session } = await supabase
    .from("qa_sessions")
    .select("id, match_id")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) {
    redirect("/discover");
  }

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("id", session.match_id)
    .maybeSingle();

  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    redirect("/discover");
  }

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
    redirect(`/qa/${sessionId}?started=true&finished=true`);
  }

  redirect(`/qa/${sessionId}/waiting`);
}
