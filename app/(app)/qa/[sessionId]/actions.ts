"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type Decision = "continue" | "pass";

export async function saveQaOutcome(formData: FormData) {
  const sessionId = String(formData.get("sessionId") ?? "");
  const decision = String(formData.get("decision") ?? "") as Decision;

  if (!sessionId || !["continue", "pass"].includes(decision)) {
    redirect("/discover");
  }

  if (sessionId === "demo-demo-match") {
    if (decision === "continue") {
      redirect("/chat/demo-demo-match");
    }

    redirect("/qa/demo-demo-match?started=true&finished=true&decision=pass");
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

  await supabase.from("qa_outcomes").upsert(
    {
      qa_session_id: sessionId,
      user_id: user.id,
      decision,
    },
    { onConflict: "qa_session_id,user_id" },
  );

  redirect(`/qa/${sessionId}/waiting`);
}
