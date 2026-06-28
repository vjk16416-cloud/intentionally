import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { saveQaOutcome } from "./actions";
import { QaDecisionButton } from "./qa-decision-controls";
import { QaSessionRoom } from "./qa-session-room";

const QUESTIONS = [
  "What is something you value in how someone communicates?",
  "What does effort look like to you in early dating?",
  "What would make a first conversation feel genuinely comfortable?",
];

type QaQuestionPayload = string | { text?: unknown };

function questionText(question: QaQuestionPayload) {
  if (typeof question === "string") return question;
  if (typeof question.text === "string") return question.text;
  return null;
}

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

  if (!user) {
    redirect("/login");
  }

  const { data: session } = await supabase
    .from("qa_sessions")
    .select("id, questions, match_id, daily_room_url, status, confirmed_at")
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
  const matchId = session.match_id;

  if (!session.confirmed_at) {
    redirect(`/schedule/${matchId}`);
  }

  if (session.status === "scheduled") {
    return (
      <main className="relative isolate min-h-[calc(100vh-57px)] overflow-hidden bg-[#071411] px-4 py-5 text-[#FFF8EC]">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_0%,rgba(243,161,127,0.18)_0%,transparent_30%),radial-gradient(circle_at_82%_18%,rgba(243,161,127,0.12)_0%,transparent_32%),linear-gradient(180deg,#071411_0%,#0D1714_54%,#050D0B_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_58%,rgba(0,0,0,0.52)_100%)]" />
        <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-2xl">
          <section className="w-full rounded-[2rem] border border-[#FFF8EC]/12 bg-[#0D1714]/82 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-[#F3A17F]">
              Vibe Check
            </p>
            <h1 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-0.035em] text-[#FFF8EC]">
              Start with a calmer conversation
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#FFF8EC]/70">
              This is an approximately 10-minute guided moment to hear how it
              feels to talk, not a test to pass. Soft Reveal keeps the listener
              softened, and you can skip anything that does not feel right.
            </p>
            <p className="mt-3 text-sm leading-6 text-[#FFF8EC]/70">
              After the Vibe Check, you both privately choose Continue or Pass.
              Chat opens only when you both want to keep going.
            </p>
            <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-[#FFF8EC]/10 bg-[#FFF8EC]/6 p-4 text-sm leading-6 text-[#FFF8EC]/68">
              <p>
                <span className="font-semibold text-[#FFF8EC]">3 questions.</span>{" "}
                Enough structure to begin, without overthinking it.
              </p>
              <p>
                <span className="font-semibold text-[#FFF8EC]">Private choice.</span>{" "}
                Passing is quiet. Continuing must be mutual.
              </p>
              <p>
                <span className="font-semibold text-[#FFF8EC]">Low pressure.</span>{" "}
                You can skip anything that does not feel right.
              </p>
            </div>
            <p className="mt-5 rounded-2xl bg-[#FFF8EC]/8 px-4 py-3 text-sm leading-6 text-[#FFF8EC]/68">
              Safety note: stay with what feels comfortable. You never need to
              share anything personal before you are ready.
            </p>
            <Link
              href={`/qa/${sessionId}/visibility`}
              className="mt-6 block rounded-2xl bg-[#F3A17F] px-4 py-4 text-center text-base font-semibold text-[#13251F] shadow-[0_18px_44px_rgba(243,161,127,0.22)] transition hover:bg-[#EA9270]"
            >
              Prepare to join
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (session.status === "completed") {
    return (
      <main className="relative isolate min-h-[calc(100vh-57px)] overflow-hidden bg-[#071411] px-4 py-5 text-[#FFF8EC]">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_0%,rgba(243,161,127,0.18)_0%,transparent_30%),radial-gradient(circle_at_82%_18%,rgba(243,161,127,0.12)_0%,transparent_32%),linear-gradient(180deg,#071411_0%,#0D1714_54%,#050D0B_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_58%,rgba(0,0,0,0.52)_100%)]" />
        <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-2xl">
          <section className="w-full rounded-[2rem] border border-[#FFF8EC]/12 bg-[#0D1714]/82 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-[#F3A17F]">
              After your Vibe Check
            </p>

            <h1 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-0.035em] text-[#FFF8EC]">
              Take a moment, then choose
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#FFF8EC]/70">
              There is no public rejection here. They only know you chose
              Continue if they choose Continue too.
            </p>

            <div className="mt-6 space-y-4">
              <div className="grid gap-3 rounded-[1.5rem] border border-[#FFF8EC]/10 bg-[#FFF8EC]/6 p-4 text-sm leading-6 text-[#FFF8EC]/68">
                <p>
                  <span className="font-semibold text-[#FFF8EC]">Continue</span>{" "}
                  if you would like to keep talking.
                </p>
                <p>
                  <span className="font-semibold text-[#FFF8EC]">
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
                    visibilityMode="dynamic"
                    className="w-full rounded-2xl bg-[#F3A17F] px-4 py-4 text-base font-semibold text-[#13251F] shadow-[0_18px_44px_rgba(243,161,127,0.22)]"
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
                    visibilityMode="dynamic"
                    className="w-full rounded-2xl border border-[#FFF8EC]/12 bg-[#FFF8EC]/6 px-4 py-4 text-base font-semibold text-[#FFF8EC]"
                  >
                    Pass privately
                  </QaDecisionButton>
                </form>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-[#FFF8EC]/8 p-4 text-sm leading-6 text-[#FFF8EC]/68">
              Your choice is handled with care. Chat opens only if you both
              choose Continue.
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (session.status !== "in_progress") {
    redirect(`/schedule/${matchId}`);
  }

  return (
    <QaSessionRoom
      sessionId={sessionId}
      userId={user.id}
      matchId={matchId}
      baseQuestions={baseQuestions}
      initialQuestionIndex={0}
      initialExtraAccepted={false}
      initialExtraRequest="idle"
      visibilityMode="dynamic"
      dailyRoomUrl={session.daily_room_url}
    />
  );
}
