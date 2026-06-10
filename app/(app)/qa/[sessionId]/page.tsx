import Link from "next/link";
import { redirect } from "next/navigation";

import { TrackedButton } from "@/components/analytics/tracked-button";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  parseQaVisibilityMode,
  qaVisibilitySearchParam,
} from "@/lib/qa/visibility";
import { createClient } from "@/lib/supabase/server";

import { saveQaOutcome } from "./actions";
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

  const baseQuestions =
    Array.isArray(session?.questions) && session.questions.length > 0
      ? session.questions.map(String)
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

  if (!started && !finished) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-2xl">
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
            <Link
              href={`/qa/${sessionId}/visibility?${visibilityParam}`}
              className="mt-6 block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
            >
              Choose how you appear
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (finished) {
    return (
      <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-2xl">
          <section className="w-full rounded-[2rem] border border-border bg-card p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
              Private decision
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight">
              Choose what feels right
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Your choice stays private. They&apos;ll only know if you both
              choose Continue.
            </p>

            {decision ? (
              <div className="mt-6 rounded-[1.5rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {decision === "continue"
                    ? "You both chose Continue."
                    : "No problem."}
                </p>
                <p className="mt-1">
                  {decision === "continue"
                    ? "Your full profiles are now unlocked and chat is open."
                    : "We&apos;ll quietly close this match. They won&apos;t be told you passed."}
                </p>
              </div>
            ) : isDemoSession ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 rounded-[1.5rem] bg-background p-4 text-sm leading-6 text-muted-foreground">
                  <p>Choose Continue if you&apos;d like to keep talking.</p>
                  <p>Choose Pass privately if it doesn&apos;t feel right.</p>
                </div>

                <div className="grid gap-3">
                  <TrackedLink
                    href="/chat/demo-demo-match"
                    eventKey="continueSelected"
                    eventProperties={{
                      session_id: sessionId,
                      decision: "continue",
                      visibility_mode: visibilityMode,
                      surface: "decision_screen",
                    }}
                    className="w-full rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
                  >
                    Continue
                  </TrackedLink>
                  <TrackedLink
                    href="/discover"
                    eventKey="passPrivatelySelected"
                    eventProperties={{
                      session_id: sessionId,
                      decision: "pass",
                      visibility_mode: visibilityMode,
                      surface: "decision_screen",
                    }}
                    className="w-full rounded-2xl border border-[#d9a6a0]/40 bg-[#f3d8d3] px-4 py-4 text-center text-base font-semibold text-[#5a2d2a]"
                  >
                    Pass privately
                  </TrackedLink>
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="grid gap-3 rounded-[1.5rem] bg-background p-4 text-sm leading-6 text-muted-foreground">
                  <p>Choose Continue if you&apos;d like to keep talking.</p>
                  <p>Choose Pass privately if it doesn&apos;t feel right.</p>
                </div>

                <div className="grid gap-3">
                  <form action={saveQaOutcome}>
                    <input type="hidden" name="sessionId" value={sessionId} />
                    <input type="hidden" name="decision" value="continue" />
                    <TrackedButton
                      type="submit"
                      eventKey="continueSelected"
                      eventProperties={{
                        session_id: sessionId,
                        decision: "continue",
                        visibility_mode: visibilityMode,
                        surface: "decision_screen",
                      }}
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
                      eventKey="passPrivatelySelected"
                      eventProperties={{
                        session_id: sessionId,
                        decision: "pass",
                        visibility_mode: visibilityMode,
                        surface: "decision_screen",
                      }}
                      className="w-full rounded-2xl border border-[#d9a6a0]/40 bg-[#f3d8d3] px-4 py-4 text-base font-semibold text-[#5a2d2a]"
                    >
                      Pass privately
                    </TrackedButton>
                  </form>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-[1.5rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
              No awkward notifications. No pressure. Full profiles unlock only
              if you both choose Continue.
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <QaSessionRoom
      sessionId={sessionId}
      baseQuestions={baseQuestions}
      initialQuestionIndex={questionIndex}
      initialExtraAccepted={extraQuestionsAccepted}
      initialExtraRequest={extraRequest}
      visibilityMode={visibilityMode}
      isDemoSession={isDemoSession}
      dailyRoomUrl={session?.daily_room_url}
    />
  );
}
