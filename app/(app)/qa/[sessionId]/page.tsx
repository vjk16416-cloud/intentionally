import { redirect } from "next/navigation";

import { TrackedButton } from "@/components/analytics/tracked-button";
import { TrackedLink } from "@/components/analytics/tracked-link";
import { createClient } from "@/lib/supabase/server";

import { saveQaOutcome } from "./actions";
import { DemoMicrophoneButton, DemoSafetyButton } from "./demo-qa-controls";
import { LocalMediaPreview } from "./local-media-preview";

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
              Conversation comes first here. Profiles stay softly blurred so
              there is less pressure to perform or decide too quickly.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Simply listen, be curious, and answer honestly. After the Q&amp;A,
              you both privately choose Continue or Pass.
            </p>
            <div className="mt-6 space-y-3 rounded-[1.5rem] bg-muted/60 p-4 text-sm leading-6 text-muted-foreground">
              <p>• Three thoughtful questions</p>
              <p>• Move on when you&apos;re both ready</p>
              <p>• Your choice stays private</p>
              <p>• Chat and profiles unlock only if you both Continue</p>
            </div>
            <p className="mt-5 text-sm font-medium text-foreground">
              Estimated time: 10 minutes
            </p>
            <TrackedLink
              href={`/qa/${sessionId}?started=true`}
              eventKey="qaStarted"
              className="mt-6 block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
            >
              Start conversation
            </TrackedLink>
          </section>
        </div>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-[#151611] px-4 py-5 text-white">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center">
          <section className="w-full rounded-[2rem] border border-white/10 bg-[#20211b] p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              Private decision
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Do you want to keep talking?
            </h1>

            <p className="mt-3 text-sm leading-6 text-white/65">
              Your choice is private. Chat and profiles unlock only if you both
              choose Continue.
            </p>

            {decision ? (
              <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-white/75">
                {decision === "continue"
                  ? "You chose Continue. In the real app, we would wait for the other person's private choice before unlocking chat and profiles."
                  : "You passed privately. In the real app, the match would close quietly."}
              </div>
            ) : isDemoSession ? (
              <div className="mt-6 grid gap-3">
                <TrackedLink
                  href="/chat/demo-demo-match"
                  eventKey="qaContinueClicked"
                  className="w-full rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
                >
                  Continue
                </TrackedLink>
                <TrackedLink
                  href="/discover"
                  eventKey="qaPassPrivatelyClicked"
                  className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-base font-semibold text-white"
                >
                  Pass privately
                </TrackedLink>
              </div>
            ) : (
              <div className="mt-6 grid gap-3">
                <form action={saveQaOutcome}>
                  <input type="hidden" name="sessionId" value={sessionId} />
                  <input type="hidden" name="decision" value="continue" />
                  <TrackedButton
                    type="submit"
                    eventKey="qaContinueClicked"
                    className="w-full rounded-2xl bg-accent px-4 py-4 text-base font-semibold text-accent-foreground"
                  >
                    Continue
                  </TrackedButton>
                </form>

                <form action={saveQaOutcome}>
                  <input type="hidden" name="sessionId" value={sessionId} />
                  <input type="hidden" name="decision" value="pass" />
                  <TrackedButton
                    type="submit"
                    eventKey="qaPassPrivatelyClicked"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-base font-semibold text-white"
                  >
                    Pass privately
                  </TrackedButton>
                </form>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#11120f] px-4 py-5 text-white">
      <div className="mx-auto w-full max-w-md space-y-4">
        <LocalMediaPreview />

        <section className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#181915] p-4 shadow-2xl">
          <header className="flex items-center justify-between border-b border-white/10 pb-4">
            <a
              href="/discover"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-xl text-white/75"
              aria-label="Exit Q&A"
            >
              ×
            </a>

            <div className="rounded-full border border-white/15 px-4 py-1.5 text-sm font-semibold text-white/85">
              Q&amp;A Room
            </div>

            {isDemoSession ? (
              <DemoSafetyButton />
            ) : (
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-lg"
                aria-label="Safety options"
              >
                🛡
              </button>
            )}
          </header>

          <div className="pt-5">
            <div className="flex items-center justify-between">
              <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/75">
                Question {questionIndex + 1} of {questions.length}
              </div>

              <div className="rounded-full bg-white/8 px-3 py-1.5 text-sm text-white/70">
                08:42 left
              </div>
            </div>

            <h1 className="mt-7 text-center text-3xl font-semibold leading-10 tracking-tight">
              {currentQuestion}
            </h1>

            <div className="mx-auto mt-5 h-6 w-6 text-center text-xl text-accent">
              ✦
            </div>

            <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-6 text-white/65">
              No perfect answer. Just be honest and speak from your experience.
            </p>

            {isDemoSession ? (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="relative min-h-64 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(to_bottom,_#313829,_#11130f)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                      You
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                      Answering
                    </span>
                  </div>

                  <div className="flex min-h-44 flex-col items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold">
                      Y
                    </div>
                  </div>

                  <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/25 px-3 py-2 text-center text-xs leading-5 text-white/70">
                    Take your time. Short, honest answers are enough.
                  </div>
                </div>

                <div className="relative min-h-64 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(to_bottom,_#343434,_#131313)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                      Maya
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/60">
                      Listening
                    </span>
                  </div>

                  <div className="flex min-h-44 flex-col items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold">
                      M
                    </div>
                  </div>

                  <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/25 px-3 py-2 text-center text-xs leading-5 text-white/70">
                    Their view stays calm while you answer.
                  </div>
                </div>
              </div>
            ) : session?.daily_room_url ? (
              <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-black">
                <iframe
                  src={session.daily_room_url}
                  title="Guided Q&A video room"
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  className="h-[420px] w-full border-0"
                />
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] bg-white/5 p-5 text-sm leading-6 text-white/70">
                Your video room is being prepared. If this continues, return to
                scheduling and confirm your Q&amp;A time again.
              </div>
            )}

            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              {isLastQuestion ? (
                <TrackedLink
                  href={nextHref}
                  eventKey="qaFinished"
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-sm font-semibold text-white"
                >
                  Skip question
                </TrackedLink>
              ) : (
                <a
                  href={nextHref}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-sm font-semibold text-white"
                >
                  Skip question
                </a>
              )}

              {isDemoSession ? (
                <DemoMicrophoneButton />
              ) : (
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eadcc8] text-3xl text-[#241c17] shadow-sm"
                  aria-label="Microphone"
                >
                  🎙
                </button>
              )}

              {isLastQuestion ? (
                <TrackedLink
                  href={nextHref}
                  eventKey="qaFinished"
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-sm font-semibold text-white"
                >
                  Finish
                </TrackedLink>
              ) : (
                <a
                  href={nextHref}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-center text-sm font-semibold text-white"
                >
                  Next question →
                </a>
              )}
            </div>

            <div className="mt-4 rounded-[1.25rem] bg-white/7 p-4">
              <div className="flex gap-3">
                <span className="text-lg">🔒</span>
                <p className="text-sm leading-6 text-white/70">
                  Profiles stay softly blurred so the conversation comes first.
                  Chat unlocks only if you both choose Continue.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}