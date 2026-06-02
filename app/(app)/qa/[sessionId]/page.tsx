import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type SessionRow = {
  id: string;
  match_id: string;
  scheduled_at: string;
  daily_room_url: string | null;
  questions: { id: string; text: string }[] | null;
  confirmed_at: string | null;
};

type MatchRow = {
  user_a: string;
  user_b: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  hour: "numeric",
  minute: "2-digit",
  day: "numeric",
  month: "long",
  hour12: true,
  timeZone: "Europe/London",
});

// 5a entry for the Q&A. Per Q3: shows the Daily.co join URL and the
// three pre-selected questions; user opens Daily's prebuilt UI in a
// new tab. Step 6 replaces this with an embedded call + the state
// machine + blur per §6.5.

export default async function QaSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS scopes qa_sessions select to the two participants — a non-
  // participant gets no row and we 404.
  const { data: session } = await supabase
    .from("qa_sessions")
    .select(
      "id, match_id, scheduled_at, daily_room_url, questions, confirmed_at",
    )
    .eq("id", sessionId)
    .maybeSingle<SessionRow>();
  if (!session) notFound();

  // Not confirmed yet — send the user back to finish scheduling.
  if (!session.confirmed_at) {
    redirect(`/schedule/${session.match_id}`);
  }

  const { data: match } = await supabase
    .from("matches")
    .select("user_a, user_b")
    .eq("id", session.match_id)
    .maybeSingle<MatchRow>();
  if (!match) notFound();

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", otherId)
    .maybeSingle<{ display_name: string | null }>();
  const otherName = otherProfile?.display_name ?? "your match";

  const when = dateFormatter.format(new Date(session.scheduled_at));
  const questions = session.questions ?? [];

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <header className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Your Q&amp;A with {otherName}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{when}</h1>
          <p className="text-xs text-muted-foreground">London time</p>
        </header>

        <section className="space-y-2 rounded-2xl border p-4">
          <h2 className="text-sm font-medium">Three questions to start you off</h2>
          <ol className="space-y-2 text-sm">
            {questions.map((q, i) => (
              <li key={q.id}>
                <span className="font-medium">Q{i + 1}.</span> {q.text}
              </li>
            ))}
          </ol>
        </section>

        {session.daily_room_url ? (
          <div className="space-y-1.5 text-center">
            <Link
              href={session.daily_room_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Open the call
            </Link>
            <p className="text-xs text-muted-foreground">
              Opens Daily.co in a new tab. Step 6 brings the call inside the
              app, with the listener blur and the timed state machine.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
