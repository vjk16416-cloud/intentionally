"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AnalyticsEvents, trackEvent } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import {
  QA_VISIBILITY_OPTIONS,
  type QaVisibilityMode,
} from "@/lib/qa/visibility";

import { DemoMicrophoneButton, DemoSafetyButton } from "./demo-qa-controls";
import { LocalMediaPreview } from "./local-media-preview";
import { VisibilitySelector } from "./visibility-selector";

const EXTRA_QUESTIONS = [
  "What would make dating feel healthier for you?",
  "What helps you feel safe opening up to someone?",
];

type ExtraRequestState = "idle" | "sent" | "incoming" | "accepted" | "declined";

type QaSessionRoomProps = {
  sessionId: string;
  userId: string;
  matchId: string | null;
  baseQuestions: string[];
  initialQuestionIndex: number;
  initialExtraAccepted: boolean;
  initialExtraRequest: ExtraRequestState;
  visibilityMode: QaVisibilityMode;
  isDemoSession: boolean;
  dailyRoomUrl?: string | null;
};

function clampQuestionIndex(value: number, total: number) {
  const maxIndex = Math.max(total - 1, 0);

  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > maxIndex) return maxIndex;

  return value;
}

export function QaSessionRoom({
  sessionId,
  userId,
  matchId,
  baseQuestions,
  initialQuestionIndex,
  initialExtraAccepted,
  initialExtraRequest,
  visibilityMode,
  isDemoSession,
  dailyRoomUrl,
}: QaSessionRoomProps) {
  const router = useRouter();
  const [extraAccepted, setExtraAccepted] = useState(initialExtraAccepted);
  const [extraRequest, setExtraRequest] =
    useState<ExtraRequestState>(initialExtraRequest);
  const questions = extraAccepted
    ? [...baseQuestions, ...EXTRA_QUESTIONS]
    : baseQuestions;
  const [questionIndex, setQuestionIndex] = useState(() =>
    clampQuestionIndex(initialQuestionIndex, questions.length),
  );
  const hasTrackedEntry = useRef(false);

  const safeQuestionIndex = clampQuestionIndex(questionIndex, questions.length);
  const currentQuestion = questions[safeQuestionIndex] ?? questions[0];
  const isLastQuestion = safeQuestionIndex === questions.length - 1;
  const demoAnsweringParticipant =
    safeQuestionIndex % 2 === 0 ? "you" : "them";
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
  const progressPercent = ((safeQuestionIndex + 1) / questions.length) * 100;
  const visibility = QA_VISIBILITY_OPTIONS[visibilityMode];
  const showExtraQuestionOption =
    !extraAccepted && safeQuestionIndex >= baseQuestions.length - 1;
  const showAcceptedNotice =
    extraAccepted && safeQuestionIndex === baseQuestions.length;

  useEffect(() => {
    if (hasTrackedEntry.current) return;

    hasTrackedEntry.current = true;
    trackAnalyticsEvent("visibilitySelected", {
      properties: {
        session_id: sessionId,
        visibility_mode: visibilityMode,
        surface: "room_entry",
        is_demo_session: isDemoSession,
      },
    });
    trackEvent(AnalyticsEvents.QA_STARTED, {
      user_id: userId,
      match_id: matchId,
      qa_session_id: sessionId,
      source: "qa",
      visibility_mode: visibilityMode,
      is_demo_session: isDemoSession,
    });
  }, [isDemoSession, matchId, sessionId, userId, visibilityMode]);

  function finishSession(extraState: ExtraRequestState = extraRequest) {
    const params = new URLSearchParams({
      started: "true",
      finished: "true",
      visibility: visibilityMode,
    });

    if (extraAccepted) {
      params.set("extra", "true");
      params.set("extraRequest", "accepted");
    } else if (extraState !== "idle") {
      params.set("extraRequest", extraState);
    }

    trackEvent(AnalyticsEvents.QA_FINISHED, {
      user_id: userId,
      match_id: matchId,
      qa_session_id: sessionId,
      source: "qa",
      visibility_mode: visibilityMode,
      question_count: questions.length,
      extra_questions: extraAccepted,
      extra_request_state: extraState,
      is_demo_session: isDemoSession,
    });
    router.push(`/qa/${sessionId}?${params.toString()}`);
  }

  function advanceQuestion() {
    if (isLastQuestion) {
      finishSession();
      return;
    }

    setQuestionIndex((current) =>
      clampQuestionIndex(current + 1, questions.length),
    );
  }

  function answerQuestion() {
    trackAnalyticsEvent("qaQuestionAnswered", {
      properties: {
        session_id: sessionId,
        visibility_mode: visibilityMode,
        question_index: safeQuestionIndex,
        question_total: questions.length,
        is_last_question: isLastQuestion,
        is_demo_session: isDemoSession,
      },
    });
    advanceQuestion();
  }

  function acceptExtraQuestions() {
    setExtraAccepted(true);
    setExtraRequest("accepted");
    setQuestionIndex(baseQuestions.length);
  }

  function declineExtraQuestions() {
    setExtraRequest("declined");
    finishSession("declined");
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#f6ecdf] to-muted px-4 py-5 text-foreground md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        <section className="overflow-hidden rounded-[2.25rem] border border-border bg-card p-4 shadow-xl md:p-5 lg:p-6">
          <header className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <a
              href="/discover"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xl text-muted-foreground"
              aria-label="Exit Vibe Check"
            >
              ×
            </a>

            <div className="min-w-0 text-center">
              <p className="text-sm font-semibold tracking-tight">
                Guided Vibe Check
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
                  Question {safeQuestionIndex + 1} of {questions.length}
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
                ) : dailyRoomUrl ? (
                  <div className="overflow-hidden rounded-[1.5rem] bg-black">
                    <iframe
                      src={dailyRoomUrl}
                      title="Guided Vibe Check video room"
                      allow="camera; microphone; fullscreen; speaker; display-capture"
                      className="h-[320px] w-full border-0 lg:h-[420px]"
                    />
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] bg-muted p-5 text-sm leading-6 text-muted-foreground">
                    Your video room is being prepared. If this continues,
                    return to scheduling and confirm your Vibe Check time again.
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
                      <button
                        type="button"
                        onClick={acceptExtraQuestions}
                        className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
                      >
                        They accept
                      </button>
                      <button
                        type="button"
                        onClick={declineExtraQuestions}
                        className="rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-foreground"
                      >
                        Not now
                      </button>
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
                      <button
                        type="button"
                        onClick={acceptExtraQuestions}
                        className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={declineExtraQuestions}
                        className="rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-foreground"
                      >
                        Not now
                      </button>
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
                      <button
                        type="button"
                        onClick={() => setExtraRequest("sent")}
                        className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
                      >
                        Add more questions
                      </button>
                      {isDemoSession ? (
                        <button
                          type="button"
                          onClick={() => setExtraRequest("incoming")}
                          className="rounded-2xl border border-border bg-card px-4 py-3 text-center text-sm font-semibold text-foreground"
                        >
                          Maya asks
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            ) : showAcceptedNotice ? (
              <div className="mx-auto w-full max-w-2xl rounded-[1.35rem] bg-secondary p-4 text-center text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  You both agreed to keep going.
                </p>
                <p>Adding 2 more questions.</p>
              </div>
            ) : null}

            <div className="mx-auto grid w-full max-w-md grid-cols-[1fr_auto_1fr] items-center gap-3">
              <button
                type="button"
                onClick={advanceQuestion}
                className="rounded-2xl border border-border bg-background px-4 py-4 text-center text-sm font-semibold text-foreground"
              >
                Skip
              </button>

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

              <button
                type="button"
                onClick={answerQuestion}
                className="rounded-2xl bg-accent px-4 py-4 text-center text-sm font-semibold text-accent-foreground"
              >
                {isLastQuestion ? "Finish" : "Next"}
              </button>
            </div>

            <div className="mx-auto w-full max-w-2xl rounded-[1.35rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground md:text-center">
              <p>Chat unlocks only if you both choose Continue.</p>
              <p>Your answers stay private. You can skip any question.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
