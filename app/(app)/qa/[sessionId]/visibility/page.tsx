import Link from "next/link";
import { redirect } from "next/navigation";

import { QA_VISIBILITY_OPTIONS } from "@/lib/qa/visibility";
import { createClient } from "@/lib/supabase/server";

import { startQaSession } from "../actions";

export default async function QaVisibilityPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const softReveal = QA_VISIBILITY_OPTIONS.dynamic;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session } = await supabase
    .from("qa_sessions")
    .select("id, match_id, status, confirmed_at")
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

  if (!session.confirmed_at) {
    redirect(`/schedule/${session.match_id}`);
  }
  if (session.status !== "scheduled" && session.status !== "in_progress") {
    redirect(`/qa/${sessionId}`);
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-3xl">
        <section className="w-full rounded-[2rem] border border-border bg-card p-6 shadow-sm">
          <Link
            href={`/qa/${sessionId}`}
            className="text-sm font-medium text-muted-foreground"
          >
            Back
          </Link>

          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Guided Vibe Check. Soft Reveal. Mutual Continue.
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Start in Soft Reveal
          </h1>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Soft Reveal is the default for every Vibe Check. Only the person
            answering is clear. The listener stays softened.
          </p>

          <form action={startQaSession} className="mt-6 grid gap-3">
            <input type="hidden" name="sessionId" value={sessionId} />

            <div className="rounded-[1.5rem] border border-border bg-background p-4">
              <p className="text-base font-semibold">{softReveal.label}</p>
              <p className="mt-1 text-sm leading-6 text-foreground">
                {softReveal.copy}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {softReveal.helper}
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
            >
              Join Vibe Check
            </button>
          </form>

          <div className="mt-5 rounded-[1.25rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
            Open Video is not available in this beta room yet. Soft Reveal
            stays on so visibility remains clear, consistent, and low pressure.
          </div>
        </section>
      </div>
    </main>
  );
}
