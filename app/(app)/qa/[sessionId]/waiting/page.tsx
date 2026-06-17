import Link from "next/link";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

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

  const { data: outcomes } = await supabase
    .from("qa_outcomes")
    .select("user_id, decision")
    .eq("qa_session_id", sessionId);

  const bothDecided = (outcomes ?? []).length >= 2;
  const bothContinue =
    bothDecided && (outcomes ?? []).every((row) => row.decision === "continue");

  if (bothContinue) {
    const adminClient = admin();
    const { data: existingChat } = await adminClient
      .from("chats")
      .select("id")
      .eq("match_id", session.match_id)
      .maybeSingle();

    if (existingChat) {
      redirect(`/chat/${existingChat.id}`);
    }

    const { data: newChat, error } = await adminClient
      .from("chats")
      .insert({ match_id: session.match_id })
      .select("id")
      .single();

    if (!error && newChat) {
      redirect(`/chat/${newChat.id}`);
    }
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#fbf3e8] to-muted px-4 py-5">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-2xl">
        <section className="w-full rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-6 text-center shadow-[0_18px_60px_rgba(74,59,42,0.10)] md:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground">
            Done
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            {bothDecided
              ? bothContinue
                ? "You both chose Continue"
                : "You passed privately"
              : "Decision saved"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {bothDecided
              ? bothContinue
                ? "Chat is now open because the feeling was mutual."
                : "We'll quietly close this match. They won't be told you passed."
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
