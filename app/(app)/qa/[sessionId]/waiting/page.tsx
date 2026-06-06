import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center">
        <section className="w-full rounded-[2rem] border bg-background p-6 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-accent-foreground">
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            {bothDecided
              ? bothContinue
                ? "You both chose to continue"
                : "This conversation has now come to a close"
              : "Decision saved"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {bothDecided
              ? bothContinue
                ? "Great conversations deserve another one. Your chat will open soon."
                : "Thank you for sharing your time today."
              : "Thanks for taking the time to connect. We&apos;re waiting for the other person&apos;s decision."}
          </p>

          {!bothDecided ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              We&apos;ll only unlock chat if you both choose to continue.
            </p>
          ) : null}

          <Link
            href="/discover"
            className="mt-6 block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
          >
            Return to Discover
          </Link>
        </section>
      </div>
    </main>
  );
}
