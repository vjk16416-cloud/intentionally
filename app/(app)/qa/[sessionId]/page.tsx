import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { saveQaOutcome } from "./actions";

const QUESTIONS = [
  "What is something you value in how someone communicates?",
  "What does effort look like to you in early dating?",
  "What would make a first conversation feel genuinely comfortable?",
];

function safeQuestionIndex(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? "0");

  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > QUESTIONS.length - 1) return QUESTIONS.length - 1;

  return parsed;
}

export default async function QaSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{
    q?: string;
    started?: string;
    finished?: string;
    decision?: string;
  }>;
}) {
  const { sessionId } = await params;
  const query = await searchParams;

  const isDemoSession = sessionId.startsWith("demo-");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session } = isDemoSession
    ? { data: null }
    : await supabase
        .from("qa_sessions")
        .select("id, questions, match_id, daily_room_url")
        .eq("id", sessionId)
        .maybeSingle();

  if (!isDemoSession && !session) {
    redirect("/discover");
  }

  if (!isDemoSession && session) {
    const { data: match } = await supabase
      .from("matches")
      .select("id, user_a, user_b")
      .eq("id", session.match_id)
      .maybeSingle();

    if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
      redirect("/discover");
    }
  }

  const questions =
    Array.isArray(session?.questions) && session.questions.length > 0
      ? session.questions.map(String)
      : QUESTIONS;

  const started = query.started === "true";
  const questionIndex = safeQuestionIndex(query.q);
  const finished = query.finished === "true";
  const decision = query.decision;

  const currentQuestion = questions[questionIndex] ?? questions[0];
  const isLastQuestion = questionIndex === questions.length - 1;

  const nextHref = isLastQuestion
    ? `/qa/${sessionId}?started=true&finished=true`
    : `/qa/${sessionId}?started=true&q=${questionIndex + 1}`;

  if (!started && !finished) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center">
          <section className="rounded-[2rem] border bg-background p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Guided Q&amp;A
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Before we begin
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This conversation is an opportunity to get to know someone beyond
              a profile. There are no perfect answers and nothing you need to
              prove.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Simply listen, be curious, and answer honestly.
            </p>
            <div className="mt-6 space-y-3 rounded-[1.5rem] bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
              <p>• Three thoughtful questions</p>
              <p>• Move on when you&apos;re both ready</p>
              <p>• Your conversation stays private</p>
              <p>• Chat only opens if you both choose to continue afterwards</p>
            </div>
            <p className="mt-5 text-sm font-medium text-foreground">
              Estimated time: 10 minutes
            </p>
            <a
              href={`/qa/${sessionId}?started=true`}
              className="mt-6 block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
            >
              Start conversation
            </a>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
              Guided Q&amp;A room
            </span>
            <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
              10 min
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Guided video Q&amp;A
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Answer one guided prompt at a time, then both people privately
              choose whether to continue.
            </p>
          </div>
        </header>

        <section className="overflow-hidden rounded-[2rem] bg-neutral-950 text-white shadow-xl">
          {isDemoSession ? (
            <div className="grid grid-cols-2 gap-3 p-3">
              <div className="flex min-h-48 flex-col justify-between rounded-[1.5rem] bg-neutral-800 p-3">
                <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                  You
                </span>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-semibold">
                  Y
                </div>
                <div className="rounded-2xl bg-white p-3 text-black">
                  <p className="text-xs font-semibold">Speaking now</p>
                  <p className="mt-1 text-xs leading-5 text-black/60">
                    Short, honest answers work best.
                  </p>
                </div>
              </div>

              <div className="flex min-h-48 flex-col justify-between rounded-[1.5rem] bg-neutral-800/80 p-3">
                <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                  Maya
                </span>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-semibold">
                  M
                </div>
                <div className="rounded-2xl bg-white p-3 text-black">
                  <p className="text-xs font-semibold">Listening mode</p>
                  <p className="mt-1 text-xs leading-5 text-black/60">
                    Softened while you answer.
                  </p>
                </div>
              </div>
            </div>
          ) : session?.daily_room_url ? (
            <iframe
              src={session.daily_room_url}
              title="Guided Q&A video room"
              allow="camera; microphone; fullscreen; speaker; display-capture"
              className="h-[420px] w-full border-0"
            />
          ) : (
            <div className="p-5 text-sm leading-6 text-white/70">
              Your video room is being prepared. If this continues, return to
              scheduling and confirm your Q&amp;A time again.
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border bg-background p-5 shadow-sm">
          {!finished ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Question {questionIndex + 1} of {questions.length}
                </p>
                <span className="rounded-full bg-muted px-3 py-1 text-xs">
                  2:00
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-semibold leading-8 tracking-tight">
                {currentQuestion}
              </h2>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-black transition-all"
                  style={{
                    width: `${((questionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Tap Next to move through the demo questions.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <a
                  href={nextHref}
                  className="block rounded-2xl border border-border bg-card px-4 py-4 text-center text-base font-semibold text-foreground"
                >
                  Skip
                </a>

                <a
                  href={nextHref}
                  className="block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
                >
                  {isLastQuestion ? "Finish" : "Next"}
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Private decision
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Do you want to keep talking?
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Chat only opens if both people choose to continue.
              </p>

              {decision ? (
                <div className="mt-5 rounded-2xl bg-muted p-4 text-sm">
                  {decision === "continue"
                    ? "You chose to continue. In the real app, we would wait for Maya’s private choice before opening chat."
                    : "You passed privately. In the real app, the match would close quietly."}
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <form action={saveQaOutcome}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <input type="hidden" name="decision" value="continue" />
                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
                    >
                      Continue
                    </button>
                  </form>

                  <form action={saveQaOutcome}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <input type="hidden" name="decision" value="pass" />
                    <button
                      type="submit"
                      className="w-full rounded-2xl border border-border bg-card px-4 py-4 text-center text-base font-semibold text-foreground"
                    >
                      Pass privately
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </section>

        <a
          href="/discover"
          className="block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
        >
          Back to Discover
        </a>
      </div>
    </main>
  );
}
