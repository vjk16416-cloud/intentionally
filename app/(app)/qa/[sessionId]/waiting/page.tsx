import Link from "next/link";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

import { WaitingAutoRefresh } from "./waiting-auto-refresh";

type UnlockedChatRow = {
  chat_id: string;
  created: boolean;
};

function admin() {
  return createServiceRoleClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

export default async function QaWaitingPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
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

  const { data: outcome } = await supabase
    .from("qa_outcomes")
    .select("id, decision")
    .eq("qa_session_id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!outcome) {
    redirect(`/qa/${sessionId}?started=true&finished=true`);
  }

  const adminClient = admin();
  const { data: outcomes } = await adminClient
    .from("qa_outcomes")
    .select("user_id, decision")
    .eq("qa_session_id", sessionId);

  const bothDecided = (outcomes ?? []).length >= 2;
  const bothContinue =
    bothDecided && (outcomes ?? []).every((row) => row.decision === "continue");

  if (bothContinue) {
    const { data: unlockedChat, error: unlockError } = await adminClient
      .rpc("unlock_chat_for_match", { p_match_id: session.match_id })
      .returns<UnlockedChatRow[]>()
      .single();

    if (!unlockError && unlockedChat?.chat_id) {
      redirect(`/chat/${unlockedChat.chat_id}`);
    }
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#fbf3e8] to-muted px-4 py-5">
      {!bothDecided ? <WaitingAutoRefresh /> : null}
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-2xl">
        <section className="w-full rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-6 text-center shadow-[0_18px_60px_rgba(74,59,42,0.10)] md:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground">
            Done
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            {bothDecided
              ? bothContinue
                ? "You both chose Continue"
                : "This match closed quietly."
              : "Decision saved"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {bothDecided
              ? bothContinue
                ? "Chat is now open because the feeling was mutual."
                : "Messages only unlock when both people choose Continue. Your choice remains private."
              : "Your choice is private. They'll only know if you both choose Continue."}
          </p>

          {!bothDecided ? (
            <div className="mt-5 rounded-[1.5rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
              No awkward notifications. No pressure. Chat opens only if you both
              choose Continue.
            </div>
          ) : null}

          <Link
            href="/discover"
            className="mt-6 block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground shadow-sm"
          >
            Return to Discover
          </Link>
        </section>
      </div>
    </main>
  );
}
