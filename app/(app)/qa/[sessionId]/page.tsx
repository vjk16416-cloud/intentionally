import Link from "next/link";
import { redirect } from "next/navigation";

import { TrackedButton } from "@/components/analytics/tracked-button";
import { TrackedLink } from "@/components/analytics/tracked-link";
import {
  QA_VISIBILITY_OPTIONS,
  parseQaVisibilityMode,
  qaVisibilitySearchParam,
} from "@/lib/qa/visibility";
import { createClient } from "@/lib/supabase/server";

import { saveQaOutcome } from "./actions";
import { DemoMicrophoneButton, DemoSafetyButton } from "./demo-qa-controls";
import { LocalMediaPreview } from "./local-media-preview";
import { VisibilitySelector } from "./visibility-selector";

const QUESTIONS = [
  "What is something you value in how someone communicates?",
  "What does effort look like to you in early dating?",
  "What would make a first conversation feel genuinely comfortable?",
];

const EXTRA_QUESTIONS = [
  "What would make dating feel healthier for you?",
  "What helps you feel safe opening up to someone?",
];

function safeQuestionIndex(value: string | string[] | undefined, total: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw ?? "0");
  const maxIndex = Math.max(total - 1, 0);

  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > maxIndex) return maxIndex;

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
  const extraRequest = query.extraRequest;
  const visibilityMode = parseQaVisibilityMode(query.visibility);
  const visibility = QA_VISIBILITY_OPTIONS[visibilityMode];
  const visibilityParam = qaVisibilitySearchParam(visibilityMode);

  const currentQuestion = questions[questionIndex] ?? questions[0];
  const isLastQuestion = questionIndex === questions.length - 1;
  const demoAnsweringParticipant = questionIndex % 2 === 0 ? "you" : "them";
  const isYouAnswering = demoAnsweringParticipant === "you";
  const isThemAnswering = demoAnsweringParticipant === "them";
  const shouldSoftenYourTile =
    visibilityMode === "dynamic" && isThemAnswering;
  const shouldSoftenTheirTile =
    visibilityMode === "dynamic" && isYouAnswering;
  const yourTileStatus = shouldSoftenYourTile
    ? "Listening softened"
    : isYouAnswering
      ? "Answering"
      : "Listening";
  const theirTileStatus = shouldSoftenTheirTile
    ? "Listening softened"
    : isThemAnswering
      ? "Answering"
      : "Listening";
  const progressPercent = ((questionIndex + 1) / questions.length) * 100;

  function qaHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams({
      started: "true",
      visibility: visibilityMode,
    });

    if (extraQuestionsAccepted) {
      params.set("extra", "true");
      params.set("extraRequest", "accepted");
    }

    Object.entries(overrides).forEach(([key, value]) => {
      if (value === undefined) {
        params.delete(key);
        return;
      }

      params.set(key, value);
    });

    return `/qa/${sessionId}?${params.toString()}`;
  }

  const nextHref = isLastQuestion
    ? qaHref({ finished: "true", q: undefined })
    : qaHref({ q: String(questionIndex + 1), finished: undefined });
  const extraStartHref = qaHref({
    extra: "true",
    extraRequest: "accepted",
    q: String(baseQuestions.length),
    finished: undefined,
  });
  const extraNotNowHref = qaHref({
    finished: "true",
    extraRequest: "declined",
    q: undefined,
  });
  const showExtraQuestionOption =
    !extraQuestionsAccepted && questionIndex >= baseQuestions.length - 1;

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
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#f6ecdf] to-muted px-4 py-5 text-foreground md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        <section className="overflow-hidden rounded-[2.25rem] border border-border bg-card p-4 shadow-xl md:p-5 lg:p-6">
          <header className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <a
              href="/discover"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xl text-muted-foreground"
              aria-label="Exit Q&A"
            >
              ×
            </a>

            <div className="min-w-0 text-center">
              <p className="text-sm font-semibold tracking-tight">
                Q&amp;A Room
              </p>
              <p className="text-[11px] text-muted-foreground">
                Guided conversation
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <VisibilitySelector mode={visibilityMode} />
              {isDemoSession ? (
                <DemoSafetyButton />
              ) : (
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-lg"
                  aria-label="Safety options"
                >
                  🛡
                </button>
              )}
            </div>
          </header>

          <div className="space-y-4 pt-5 md:space-y-5">
            <div className="rounded-[1.35rem] border border-border bg-background p-3 md:px-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-muted-foreground">
                  Question {questionIndex + 1} of {questions.length}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                  08:42
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="relative grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)_minmax(0,1fr)] md:items-center lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)_minmax(0,1fr)]">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border md:hidden" />

              <div className="relative z-10 rounded-[1.75rem] border border-border bg-background p-3 shadow-sm md:order-1">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold">
                    You
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                    {visibilityMode === "audio" ? "Audio-first" : yourTileStatus}
                  </span>
                </div>

                {visibilityMode === "audio" ? (
                  <div className="relative min-h-44 overflow-hidden rounded-[1.5rem] bg-[#2d3028] p-4 text-white lg:min-h-72">
                    <div className="flex min-h-28 flex-col items-center justify-center gap-4 lg:min-h-56">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e2e8dc] text-xl font-semibold text-[#241c17]">
                        Y
                      </div>
                      <div className="flex h-8 items-end gap-1.5">
                        {[18, 30, 22, 38, 26, 34, 20].map((height, index) => (
                          <span
                            key={`${height}-${index}`}
                            className="w-2 rounded-full bg-[#e8ded0]"
                            style={{ height }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/30 px-3 py-2 text-center text-xs leading-5 text-white/80">
                      Voice-first with a simple profile preview.
                    </p>
                  </div>
                ) : (
                  <LocalMediaPreview
                    visibilityMode={visibilityMode}
                    isSoftened={shouldSoftenYourTile}
                    statusLabel={yourTileStatus}
                    helperText={
                      shouldSoftenYourTile
                        ? "Dynamic Mode softens the listener so the speaker feels less watched."
                        : isYouAnswering
                          ? "You stay clear while you answer."
                          : "You stay clear while listening."
                    }
                    isCompact
                  />
                )}
              </div>

              <div className="relative z-10 rounded-[1.75rem] border border-[#d8ccbd] bg-[#fff8ef] p-6 text-center shadow-sm md:order-2 md:p-6 lg:p-8">
                <div className="mx-auto mb-4 h-8 w-8 rounded-full bg-secondary text-lg leading-8 text-accent">
                  ✦
                </div>
                <h1 className="text-2xl font-semibold leading-8 tracking-tight md:text-3xl md:leading-10">
                  {currentQuestion}
                </h1>
                <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                  No perfect answer. Just be honest.
                </p>
                <div className="mx-auto mt-4 max-w-xs rounded-2xl bg-secondary px-4 py-3">
                  <p className="text-xs font-semibold text-foreground">
                    {visibility.shortLabel}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {visibility.roomCopy}
                  </p>
                </div>
              </div>

              <div className="relative z-10 rounded-[1.75rem] border border-border bg-background p-3 shadow-sm md:order-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold">
                    Maya
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                    {theirTileStatus}
                  </span>
                </div>

                {isDemoSession ? (
                  <div className="relative min-h-44 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(to_bottom,_#343434,_#131313)] p-3 text-white lg:min-h-72">
                    <div
                      className={
                        shouldSoftenTheirTile
                          ? "absolute inset-0 scale-105 bg-[linear-gradient(to_bottom,_#343434,_#131313)] blur-sm opacity-75"
                          : "absolute inset-0 bg-[linear-gradient(to_bottom,_#343434,_#131313)]"
                      }
                    />
                    <div
                      className={
                        shouldSoftenTheirTile
                          ? "absolute inset-0 bg-black/15"
                          : "absolute inset-0"
                      }
                    />

                    <div className="relative z-10 flex min-h-32 flex-col items-center justify-center lg:min-h-60">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-2xl font-semibold">
                        M
                      </div>
                    </div>

                    <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl bg-black/25 px-3 py-2 text-center text-xs leading-5 text-white/70">
                      {shouldSoftenTheirTile
                        ? "Dynamic Mode softens the listener so the speaker feels less watched."
                        : isYouAnswering
                          ? "They stay clear while listening."
                          : "They stay clear while answering."}
                    </div>
                  </div>
                ) : session?.daily_room_url ? (
                  <div className="overflow-hidden rounded-[1.5rem] bg-black">
                    <iframe
                      src={session.daily_room_url}
                      title="Guided Q&A video room"
                      allow="camera; microphone; fullscreen; speaker; display-capture"
                      className="h-[320px] w-full border-0 lg:h-[420px]"
                    />
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] bg-muted p-5 text-sm leading-6 text-muted-foreground">
                    Your video room is being prepared. If this continues,
                    return to scheduling and confirm your Q&amp;A time again.
                  </div>
                )}
              </div>
            </div>

            {showExtraQuestionOption ? (
              <div className="mx-auto w-full max-w-2xl rounded-[1.35rem] border border-border bg-background p-4 shadow-sm">
                {extraRequest === "sent" ? (
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="text-sm font-semibold">Request sent</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Waiting for them to accept. We&apos;ll only add more if
                        you both agree.
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                      <a
                        href={extraStartHref}
                        className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
                      >
                        They accept
                      </a>
                      <a
                        href={extraNotNowHref}
                        className="rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-foreground"
                      >
                        Not now
                      </a>
                    </div>
                  </div>
                ) : extraRequest === "incoming" ? (
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="text-sm font-semibold">
                        Maya wants to add more questions.
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Only continue if you both want to.
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                      <a
                        href={extraStartHref}
                        className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
                      >
                        Accept
                      </a>
                      <a
                        href={extraNotNowHref}
                        className="rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-foreground"
                      >
                        Not now
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="text-sm font-semibold">
                        Want to keep going?
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Add more questions only if you both agree. This is
                        optional.
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                      <a
                        href={qaHref({
                          extraRequest: "sent",
                          q: String(questionIndex),
                          finished: undefined,
                        })}
                        className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
                      >
                        Add more questions
                      </a>
                      {isDemoSession ? (
                        <a
                          href={qaHref({
                            extraRequest: "incoming",
                            q: String(questionIndex),
                            finished: undefined,
                          })}
                          className="rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-foreground"
                        >
                          Maya asks
                        </a>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ) : extraQuestionsAccepted &&
              questionIndex === baseQuestions.length ? (
              <div className="mx-auto w-full max-w-2xl rounded-[1.35rem] bg-secondary p-4 text-center text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  You both agreed to keep going.
                </p>
                <p>Adding 2 more questions.</p>
              </div>
            ) : null}

            <div className="mx-auto grid w-full max-w-md grid-cols-[1fr_auto_1fr] items-center gap-3">
              {isLastQuestion ? (
                <TrackedLink
                  href={nextHref}
                  eventKey="qaFinished"
                  className="rounded-2xl border border-border bg-background px-4 py-4 text-center text-sm font-semibold text-foreground"
                >
                  Skip
                </TrackedLink>
              ) : (
                <a
                  href={nextHref}
                  className="rounded-2xl border border-border bg-background px-4 py-4 text-center text-sm font-semibold text-foreground"
                >
                  Skip
                </a>
              )}

              {isDemoSession ? (
                <DemoMicrophoneButton />
              ) : (
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl text-accent-foreground shadow-sm"
                  aria-label="Tap to speak"
                >
                  🎙
                </button>
              )}

              {isLastQuestion ? (
                <TrackedLink
                  href={nextHref}
                  eventKey="qaFinished"
                  className="rounded-2xl bg-accent px-4 py-4 text-center text-sm font-semibold text-accent-foreground"
                >
                  Finish
                </TrackedLink>
              ) : (
                <a
                  href={nextHref}
                  className="rounded-2xl bg-accent px-4 py-4 text-center text-sm font-semibold text-accent-foreground"
                >
                  Next
                </a>
              )}
            </div>

            <div className="mx-auto w-full max-w-2xl rounded-[1.35rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground md:text-center">
              <p>Full profiles unlock only if you both choose Continue.</p>
              <p>Your answers stay private. You can skip any question.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
