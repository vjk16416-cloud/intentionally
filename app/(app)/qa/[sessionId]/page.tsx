import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Video,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { resolveStoredVideoSession } from "@/lib/video/provider";

import { saveQaOutcome } from "./actions";
import { QaDecisionButton } from "./qa-decision-controls";
import { QaSessionRoom } from "./qa-session-room";

const QUESTIONS = [
  "What is something you value in how someone communicates?",
  "What does effort look like to you in early dating?",
  "What would make a first conversation feel genuinely comfortable?",
];

const scheduledDateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  hour: "numeric",
  minute: "2-digit",
  day: "numeric",
  month: "long",
  hour12: true,
  timeZone: "Europe/London",
});

type QaQuestionPayload = string | { text?: unknown };

type ParticipantProfile = {
  id: string;
  display_name: string | null;
};

function questionText(question: QaQuestionPayload) {
  if (typeof question === "string") return question;
  if (typeof question.text === "string") return question.text;
  return null;
}

function formatScheduledAt(value: string | null | undefined) {
  if (!value) return "Time to be confirmed";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time to be confirmed";

  return `${scheduledDateFormatter.format(date)} London time`;
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
    .select(
      "id, questions, match_id, daily_room_url, daily_room_name, video_provider, video_room_name, status, confirmed_at, scheduled_at",
    )
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

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", [match.user_a, match.user_b])
    .returns<ParticipantProfile[]>();
  const otherProfile = profiles?.find((profile) => profile.id === otherId);
  const otherName = otherProfile?.display_name ?? "your match";
  const otherInitial = otherName.trim().slice(0, 1).toUpperCase() || "I";
  const scheduledAt = formatScheduledAt(session.scheduled_at);

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
      <main className="min-h-[calc(100vh-57px)] bg-[linear-gradient(180deg,#f8f4ec_0%,#f1e8da_100%)] px-4 py-6 pb-28 text-foreground sm:px-6 sm:py-10 lg:px-8">
        <section className="mx-auto grid min-h-[calc(100vh-105px)] w-full max-w-6xl content-center gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="space-y-3 md:space-y-5 lg:space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Scheduled Vibe Check
            </p>
            <div className="space-y-3">
              <h1 className="max-w-xl text-[2rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[3.25rem]">
                Start with a calmer conversation.
              </h1>
              <p className="hidden max-w-xl text-sm leading-6 text-muted-foreground sm:block sm:text-base sm:leading-7">
                You and {otherName} will meet for three guided questions before
                either of you decides whether to keep talking.
              </p>
            </div>

            <div className="hidden max-w-xl space-y-5 pt-3 lg:grid">
              <div className="flex gap-3">
                <MessageCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#697b60]"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Guided conversation
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Three thoughtful prompts help you get to know each other.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <LockKeyhole
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#697b60]"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Your choice stays private
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Continue or Pass is only revealed if both people continue.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#697b60]"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Designed for safety
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Your comfort and privacy are prioritised.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/60 bg-card p-4 shadow-[0_18px_60px_rgba(74,59,42,0.10)] sm:p-6 md:p-7 lg:p-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#cfdbca] bg-secondary text-base font-semibold text-[#536849] sm:h-16 sm:w-16 sm:text-lg"
                aria-hidden="true"
              >
                {otherInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  You&apos;re meeting
                </p>
                <h2 className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-foreground">
                  {otherName}
                </h2>
              </div>
            </div>

            <Link
              href={`/qa/${sessionId}/visibility`}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-6 w-full rounded-2xl bg-[#75886b] text-white shadow-[0_8px_18px_rgba(83,104,73,0.14)] hover:bg-[#697b60] sm:mt-8",
              )}
            >
              <Video
                className="h-4 w-4"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              Prepare to join
            </Link>

            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole
                className="h-4 w-4 text-[#697b60]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              Private until you both continue.
            </p>

            <dl className="mt-[1.625rem] border-t border-border/60 pt-6 sm:mt-9 sm:pt-7">
              <div>
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <CalendarDays
                    className="h-4 w-4 text-[#697b60]"
                    strokeWidth={1.75}
                  />
                  When
                </dt>
                <dd className="mt-2 text-sm font-semibold leading-6 text-foreground">
                  {scheduledAt}
                </dd>
              </div>
            </dl>

            <div className="mt-[1.625rem] border-t border-border/60 pt-6 sm:mt-9 sm:pt-7">
              <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MessageCircle
                  className="h-4 w-4 text-[#697b60]"
                  strokeWidth={1.75}
                />
                What will happen
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Three thoughtful prompts, one at a time. You can take your time
                and skip anything.
              </p>
            </div>

            <div className="mt-[1.625rem] flex items-center gap-2 border-t border-border/60 pt-5 text-[0.7rem] text-muted-foreground/75 sm:mt-9 sm:pt-6">
              <Clock3
                className="h-4 w-4 text-[#697b60]/75"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span>About 10 minutes</span>
            </div>
          </div>
        </section>
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

  if (session.status === "no_show" || session.status === "cancelled") {
    return (
      <main className="relative isolate min-h-[calc(100vh-57px)] overflow-hidden bg-[#071411] px-4 py-5 text-[#FFF8EC]">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_0%,rgba(243,161,127,0.18)_0%,transparent_30%),linear-gradient(180deg,#071411_0%,#0D1714_54%,#050D0B_100%)]" />
        <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center md:max-w-2xl">
          <section className="w-full rounded-[2rem] border border-[#FFF8EC]/12 bg-[#0D1714]/82 p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl md:p-8">
            <p className="text-xs uppercase tracking-[0.22em] text-[#F3A17F]">
              Vibe Check unavailable
            </p>
            <h1 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-[-0.035em]">
              This Vibe Check is no longer open.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#FFF8EC]/70">
              The private video room has closed. Return to the scheduled
              session to see what is available next.
            </p>
            <Link
              href={`/schedule/${matchId}`}
              className="mt-6 block rounded-2xl bg-[#F3A17F] px-4 py-4 text-center text-base font-semibold text-[#13251F]"
            >
              Return to scheduled session
            </Link>
          </section>
        </div>
      </main>
    );
  }

  if (session.status !== "in_progress") {
    redirect(`/schedule/${matchId}`);
  }

  const videoSession = resolveStoredVideoSession(session);

  return (
    <QaSessionRoom
      sessionId={sessionId}
      matchId={matchId}
      baseQuestions={baseQuestions}
      initialQuestionIndex={0}
      initialExtraAccepted={false}
      initialExtraRequest="idle"
      visibilityMode="dynamic"
      videoProvider={videoSession.ok ? videoSession.provider : null}
      dailyRoomUrl={
        videoSession.ok && videoSession.provider === "daily"
          ? videoSession.dailyRoomUrl
          : null
      }
      videoSetupError={videoSession.ok ? null : videoSession.message}
      isCurrentUserMatchA={match.user_a === user.id}
    />
  );
}
