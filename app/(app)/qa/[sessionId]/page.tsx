import Link from "next/link";
import { redirect } from "next/navigation";

import {
  parseQaVisibilityMode,
  qaVisibilitySearchParam,
} from "@/lib/qa/visibility";
import { createClient } from "@/lib/supabase/server";

import { saveQaOutcome } from "./actions";
import { QaDecisionButton } from "./qa-decision-controls";
import { QaSessionRoom } from "./qa-session-room";

const QUESTIONS = [
  "What is something you value in how someone communicates?",
  "What does effort look like to you in early dating?",
  "What would make a first conversation feel genuinely comfortable?",
];

const EXTRA_QUESTIONS = [
  "What would make dating feel healthier for you?",
  "What helps you feel safe opening up to someone?",
];

type QaQuestionPayload = string | { text?: unknown };

type ExtraRequestState = "idle" | "sent" | "incoming" | "accepted" | "declined";

function safeQuestionIndex(value: string | string[] | undefined, total: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? "0");
  const maxIndex = Math.max(total - 1, 0);

  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > maxIndex) return maxIndex;

  return parsed;
}

function parseExtraRequestState(
  value: string | string[] | undefined,
): ExtraRequestState {
  const raw = Array.isArray(value) ? value[0] : value;

  if (
    raw === "sent" ||
    raw === "incoming" ||
    raw === "accepted" ||
    raw === "declined"
  ) {
    return raw;
  }

  return "idle";
}

function questionText(question: QaQuestionPayload) {
  if (typeof question === "string") return question;
  if (typeof question.text === "string") return question.text;
  return null;
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
    visibility?: string;
    extra?: string;
    extraRequest?: string;
  }>;
}) {
  const { sessionId } = await params;
  const query = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session } = await supabase
    .from("qa_sessions")
    .select("id, questions, match_id, daily_room_url")
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

  const baseQuestions =
    Array.isArray(session?.questions) && session.questions.length > 0
      ? (session.questions as QaQuestionPayload[]).flatMap((question) => {
          const text = questionText(question);
          return text ? [text] : [];
        })
      : QUESTIONS;
  const extraQuestionsAccepted = query.extra === "true";
  const questions = extraQuestionsAccepted
    ? [...baseQuestions, ...EXTRA_QUESTIONS]
    : baseQuestions;

  const started = query.started === "true";
  const questionIndex = safeQuestionIndex(query.q, questions.length);
  const finished = query.finished === "true";
  const decision = query.decision;
  const extraRequest = parseExtraRequestState(query.extraRequest);
  const visibilityMode = parseQaVisibilityMode(query.visibility);
  const visibilityParam = qaVisibilitySearchParam(visibilityMode);
  const matchId = session.match_id;

  if (!started && !finished) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#fbf3e8] to-muted px-4 py-5">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-2xl">
          <section className="w-full rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-6 shadow-[0_18px_60px_rgba(74,59,42,0.10)] md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Vibe Check
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
              Start with a calmer conversation
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              This is an approximately 10-minute guided moment to hear how it
              feels to talk, not a test to pass. Soft Reveal keeps the listener
              softened, and you can skip anything that does not feel right.
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              After the Vibe Check, you both privately choose Continue or Pass.
              Chat opens only when you both want to keep going.
            </p>
            <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-[#eadfce] bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">3 questions.</span>{" "}
                Enough structure to begin, without overthinking it.
              </p>
              <p>
                <span className="font-semibold text-foreground">Private choice.</span>{" "}
                Passing is quiet. Continuing must be mutual.
              </p>
              <p>
                <span className="font-semibold text-foreground">Low pressure.</span>{" "}
                You can skip anything that does not feel right.
              </p>
            </div>
            <p className="mt-5 rounded-2xl bg-secondary px-4 py-3 text-sm leading-6 text-muted-foreground">
              Safety note: stay with what feels comfortable. You never need to
              share anything personal before you are ready.
            </p>
            <Link
              href={`/qa/${sessionId}/visibility?${visibilityParam}`}
              className="mt-6 block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground shadow-sm"
            >
              Prepare to join
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#fbf3e8] to-muted px-4 py-5">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-2xl">
          <section className="w-full rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-6 shadow-[0_18px_60px_rgba(74,59,42,0.10)] md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              After your Vibe Check
            </p>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
              Take a moment, then choose
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              There is no public rejection here. They only know you chose
              Continue if they choose Continue too.
            </p>

            {decision ? (
              <div className="mt-6 rounded-[1.5rem] border border-[#eadfce] bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {decision === "continue"
                    ? "You both chose Continue"
                    : "You passed privately"}
                </p>
                <p className="mt-1">
                  {decision === "continue"
                    ? "Chat is now open because the feeling was mutual."
                    : "We'll quietly close this match. They won't be told you passed."}
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 rounded-[1.5rem] border border-[#eadfce] bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">
                      Continue
                    </span>{" "}
                    if you would like to keep talking.
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">
                      Pass privately
                    </span>{" "}
                    if it does not feel right.
                  </p>
                </div>

                <div className="grid gap-3">
                  <form action={saveQaOutcome}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <input type="hidden" name="decision" value="continue" />
                    <QaDecisionButton
                      type="submit"
                      decision="continue"
                      userId={user.id}
                      matchId={matchId}
                      sessionId={sessionId}
                      visibilityMode={visibilityMode}
                      className="w-full rounded-2xl bg-accent px-4 py-4 text-base font-semibold text-accent-foreground shadow-sm"
                    >
                      Continue
                    </QaDecisionButton>
                  </form>

                  <form action={saveQaOutcome}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <input type="hidden" name="decision" value="pass" />
                    <QaDecisionButton
                      type="submit"
                      decision="pass"
                      userId={user.id}
                      matchId={matchId}
                      sessionId={sessionId}
                      visibilityMode={visibilityMode}
                      className="w-full rounded-2xl border border-[#d9a6a0]/40 bg-[#f6e4df] px-4 py-4 text-base font-semibold text-[#5a2d2a]"
                    >
                      Pass privately
                    </QaDecisionButton>
                  </form>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-[1.5rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
              Your choice is handled with care. Chat opens only if you both
              choose Continue.
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <QaSessionRoom
      sessionId={sessionId}
      userId={user.id}
      matchId={matchId}
      baseQuestions={baseQuestions}
      initialQuestionIndex={questionIndex}
      initialExtraAccepted={extraQuestionsAccepted}
      initialExtraRequest={extraRequest}
      visibilityMode={visibilityMode}
      dailyRoomUrl={session.daily_room_url}
    />
  );
}
