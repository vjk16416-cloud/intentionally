"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";

import { AnalyticsEvents, trackEvent } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import {
  QA_VISIBILITY_OPTIONS,
  type QaVisibilityMode,
} from "@/lib/qa/visibility";
import type { VideoProvider } from "@/lib/video/provider";

import { LocalMediaPreview } from "./local-media-preview";
import {
  LiveKitParticipantVideo,
  LiveKitVideoRoom,
  type LiveKitVideoRoomHandle,
} from "./livekit-video-room";
import { QaSafetyControls } from "./qa-safety-controls";
import { VisibilitySelector } from "./visibility-selector";
import { completeQaSession } from "./actions";

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
  videoProvider: VideoProvider | null;
  dailyRoomUrl: string | null;
  videoSetupError: string | null;
  isCurrentUserMatchA: boolean;
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
  videoProvider,
  dailyRoomUrl,
  videoSetupError,
  isCurrentUserMatchA,
}: QaSessionRoomProps) {
  const [extraAccepted, setExtraAccepted] = useState(initialExtraAccepted);
  const [extraRequest, setExtraRequest] =
    useState<ExtraRequestState>(initialExtraRequest);
  const questions = extraAccepted
    ? [...baseQuestions, ...EXTRA_QUESTIONS]
    : baseQuestions;
  const [questionIndex, setQuestionIndex] = useState(() =>
    clampQuestionIndex(initialQuestionIndex, questions.length),
  );
  const [pauseEndsAt, setPauseEndsAt] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [softModeEnabled, setSoftModeEnabled] = useState(false);
  const [, startCompletionTransition] = useTransition();
  const hasTrackedEntry = useRef(false);
  const liveKitRoomRef = useRef<LiveKitVideoRoomHandle | null>(null);

  const safeQuestionIndex = clampQuestionIndex(questionIndex, questions.length);
  const currentQuestion = questions[safeQuestionIndex] ?? questions[0];
  const isLastQuestion = safeQuestionIndex === questions.length - 1;
  const isMatchAAnswering = safeQuestionIndex % 2 === 0;
  const isYouAnswering = isMatchAAnswering === isCurrentUserMatchA;
  const isThemAnswering = !isYouAnswering;
  const effectiveVisibilityMode: QaVisibilityMode = "dynamic";
  const shouldSoftenYourTile =
    softModeEnabled || (effectiveVisibilityMode === "dynamic" && isThemAnswering);
  const shouldSoftenTheirTile =
    softModeEnabled || (effectiveVisibilityMode === "dynamic" && isYouAnswering);
  const yourTileStatus = softModeEnabled
    ? "Soft Mode"
    : shouldSoftenYourTile
    ? "Listening softened"
    : isYouAnswering
      ? "Answering"
      : "Listening";
  const theirTileStatus = softModeEnabled
    ? "Soft Mode"
    : shouldSoftenTheirTile
    ? "Listening softened"
    : isThemAnswering
      ? "Answering"
      : "Listening";
  const progressPercent = ((safeQuestionIndex + 1) / questions.length) * 100;
  const visibility = QA_VISIBILITY_OPTIONS[effectiveVisibilityMode];
  const activeSpeakerLabel = isYouAnswering ? "Your turn" : "Their turn";
  const nextActionLabel = isLastQuestion ? "Review choices" : "Next question";
  const showExtraQuestionOption =
    !extraAccepted && safeQuestionIndex >= baseQuestions.length - 1;
  const showAcceptedNotice =
    extraAccepted && safeQuestionIndex === baseQuestions.length;
  const isPaused = timeRemaining > 0;

  useEffect(() => {
    if (!pauseEndsAt) return;
    const endsAt = pauseEndsAt;

    function updateTimeRemaining() {
      const nextTimeRemaining = Math.max(
        0,
        Math.ceil((endsAt - Date.now()) / 1000),
      );
      setTimeRemaining(nextTimeRemaining);

      if (nextTimeRemaining === 0) setPauseEndsAt(null);
    }

    updateTimeRemaining();
    const interval = window.setInterval(updateTimeRemaining, 1_000);
    return () => window.clearInterval(interval);
  }, [pauseEndsAt]);

  useEffect(() => {
    if (hasTrackedEntry.current) return;

    hasTrackedEntry.current = true;
    trackAnalyticsEvent("visibilitySelected", {
      properties: {
        session_id: sessionId,
        visibility_mode: visibilityMode,
        effective_visibility_mode: effectiveVisibilityMode,
        surface: "room_entry",
      },
    });
    trackEvent(AnalyticsEvents.QA_STARTED, {
      user_id: userId,
      match_id: matchId,
      qa_session_id: sessionId,
      source: "qa",
      visibility_mode: visibilityMode,
      effective_visibility_mode: effectiveVisibilityMode,
    });
  }, [effectiveVisibilityMode, matchId, sessionId, userId, visibilityMode]);

  function finishSession(extraState: ExtraRequestState = extraRequest) {
    trackEvent(AnalyticsEvents.QA_FINISHED, {
      user_id: userId,
      match_id: matchId,
      qa_session_id: sessionId,
      source: "qa",
      visibility_mode: effectiveVisibilityMode,
      question_count: questions.length,
      extra_questions: extraAccepted,
      extra_request_state: extraState,
    });
    const formData = new FormData();
    formData.set("sessionId", sessionId);
    startCompletionTransition(async () => {
      await completeQaSession(formData);
    });
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
        visibility_mode: effectiveVisibilityMode,
        question_index: safeQuestionIndex,
        question_total: questions.length,
        is_last_question: isLastQuestion,
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

  function pauseForThirtySeconds() {
    setPauseEndsAt(Date.now() + 30_000);
  }

  function renderRoom() {
    return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#fbf3e8] to-muted px-3 py-3 text-foreground md:px-6 md:py-5 lg:px-8">
      <div className="mx-auto w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        <section className="overflow-hidden rounded-[1.75rem] border border-[#e6ded0] bg-[#fffaf3] p-3 shadow-[0_24px_80px_rgba(74,59,42,0.12)] md:rounded-[2.25rem] md:p-5 lg:p-6">
          <header className="flex items-center justify-between gap-3 border-b border-border pb-3 md:pb-4">
            <QaSafetyControls
              isPaused={isPaused}
              onPause={pauseForThirtySeconds}
              onEnd={() => finishSession()}
              onSoftMode={() => setSoftModeEnabled(true)}
              softModeEnabled={softModeEnabled}
            />

            <div className="min-w-0 text-center">
              <p className="text-sm font-semibold tracking-tight">Vibe Check</p>
              <p className="text-[11px] text-muted-foreground">
                A guided conversation, not a performance
              </p>
            </div>

            <p className="max-w-24 shrink-0 text-right text-[11px] leading-4 text-muted-foreground">
              You&apos;re in control
            </p>
          </header>

          <div className="space-y-3 pt-3 md:space-y-5 md:pt-5">
            <div className="rounded-[1.25rem] border border-[#eadfce] bg-background/75 p-2.5 md:rounded-[1.35rem] md:p-3 md:px-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Question {safeQuestionIndex + 1} of {questions.length}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                  {activeSpeakerLabel}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-3 hidden text-xs leading-5 text-muted-foreground sm:block">
                Move forward when the answer feels complete. Skipping is always
                okay.
              </p>
            </div>

            <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)_minmax(0,1fr)] lg:items-center">
              <div className="relative z-10 order-2 rounded-[1.35rem] border border-[#eadfce] bg-background/85 p-2.5 shadow-sm md:rounded-[1.75rem] md:p-3 lg:order-1">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold">
                    You
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                    {visibilityMode === "audio" ? "Audio-first" : yourTileStatus}
                  </span>
                </div>

                {visibilityMode === "audio" ? (
                  <div className="relative min-h-36 overflow-hidden rounded-[1.25rem] bg-[#2d3028] p-4 text-white sm:min-h-44 md:rounded-[1.5rem] lg:min-h-72">
                    <div className="flex min-h-24 flex-col items-center justify-center gap-4 sm:min-h-28 lg:min-h-56">
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
                ) : videoProvider === "livekit" ? (
                  <LiveKitParticipantVideo
                    participant="local"
                    isSoftened={shouldSoftenYourTile}
                    helperText={
                      shouldSoftenYourTile
                        ? "Soft Reveal keeps the listener softened so the speaker feels less watched."
                        : isYouAnswering
                          ? "Take a breath. A short, honest answer is enough."
                          : "Listen without rushing your response."
                    }
                  />
                ) : videoProvider === "daily" ? (
                  <LocalMediaPreview
                    visibilityMode={effectiveVisibilityMode}
                    isSoftened={shouldSoftenYourTile}
                    statusLabel={yourTileStatus}
                    helperText={
                      shouldSoftenYourTile
                        ? "Soft Reveal keeps the listener softened so the speaker feels less watched."
                        : isYouAnswering
                          ? "Take a breath. A short, honest answer is enough."
                          : "Listen without rushing your response."
                    }
                    isCompact
                  />
                ) : (
                  <VideoSetupMessage
                    message={videoSetupError}
                    returnHref={matchId ? `/schedule/${matchId}` : "/discover"}
                  />
                )}
              </div>

              <div className="relative z-10 order-1 rounded-[1.5rem] border border-[#d8ccbd] bg-[#fff8ef] p-4 text-center shadow-[0_16px_48px_rgba(74,59,42,0.10)] md:rounded-[1.75rem] md:p-6 lg:order-2 lg:p-8">
                <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-accent md:mb-4 md:h-9 md:w-9">
                  {safeQuestionIndex + 1}
                </div>
                <h1 className="text-xl font-semibold leading-7 tracking-tight sm:text-2xl sm:leading-8 md:text-3xl md:leading-10">
                  {currentQuestion}
                </h1>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-5 text-muted-foreground md:mt-4 md:leading-6">
                  There is no perfect answer. Stay honest, kind, and within
                  what feels comfortable.
                </p>
                <div className="mx-auto mt-4 max-w-xs rounded-2xl border border-[#eadfce] bg-background/70 px-3 py-2.5 md:mt-5 md:px-4 md:py-3">
                  <p className="text-xs font-semibold text-foreground">
                    {visibility.shortLabel}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {visibility.roomCopy}
                  </p>
                </div>

                <p className="mx-auto mt-4 max-w-xs rounded-2xl bg-secondary/70 px-3 py-2 text-xs leading-5 text-muted-foreground">
                  Answer out loud when ready. Use Next question when the answer
                  feels complete.
                </p>

                <div className="mx-auto mt-4 grid w-full max-w-md grid-cols-2 items-center gap-2 md:gap-3">
                  <button
                    type="button"
                    onClick={advanceQuestion}
                    disabled={isPaused}
                    className="rounded-2xl border border-border bg-background px-3 py-3 text-center text-sm font-semibold text-foreground shadow-sm md:px-4 md:py-4"
                  >
                    Skip
                  </button>

                  <button
                    type="button"
                    onClick={answerQuestion}
                    disabled={isPaused}
                    className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground shadow-sm md:px-4 md:py-4"
                  >
                    {nextActionLabel}
                  </button>
                </div>
              </div>

              <div className="relative z-10 order-3 rounded-[1.35rem] border border-[#eadfce] bg-background/85 p-2.5 shadow-sm md:rounded-[1.75rem] md:p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold">
                    Your match
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                    {theirTileStatus}
                  </span>
                </div>

                {videoProvider === "livekit" ? (
                  <LiveKitParticipantVideo
                    participant="remote"
                    isSoftened={shouldSoftenTheirTile}
                    helperText={
                      shouldSoftenTheirTile
                        ? "Soft Reveal keeps the listener gently softened."
                        : isThemAnswering
                          ? "Give your match the space to answer in their own way."
                          : "Your match is listening."
                    }
                  />
                ) : videoProvider === "daily" && dailyRoomUrl ? (
                  <div className="overflow-hidden rounded-[1.5rem] bg-black">
                    <iframe
                      src={dailyRoomUrl}
                      title="Guided Vibe Check video room"
                      allow="camera; microphone; fullscreen; speaker; display-capture"
                      className={`h-40 w-full border-0 transition duration-500 sm:h-52 md:h-[320px] lg:h-[420px] ${
                        shouldSoftenTheirTile
                          ? "scale-105 blur-sm opacity-75"
                          : ""
                      }`}
                    />
                  </div>
                ) : (
                  <VideoSetupMessage
                    message={videoSetupError}
                    returnHref={matchId ? `/schedule/${matchId}` : "/discover"}
                  />
                )}
              </div>

              {isPaused ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.5rem] bg-[#fff8ef]/95 p-6 text-center backdrop-blur-sm md:rounded-[1.75rem]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Taking a pause
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">
                      Take your time.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      The guide resumes in {timeRemaining} seconds. Your match is not given a reason.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {showExtraQuestionOption ? (
              <div className="mx-auto w-full max-w-2xl rounded-[1.35rem] border border-[#eadfce] bg-background/75 p-4 shadow-sm">
                {extraRequest === "sent" ? (
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="text-sm font-semibold">Request sent</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        We&apos;ll only add more if you both still have energy
                        for it.
                      </p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                      <button
                        type="button"
                        onClick={acceptExtraQuestions}
                        className="rounded-2xl bg-accent px-4 py-3 text-center text-sm font-semibold text-accent-foreground"
                      >
                        Accepted
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
                        Your match wants to keep going
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Add two more questions only if this still feels good.
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
                        Want a little more time?
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        You can invite two more questions. It only continues if
                        you both agree.
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
                    </div>
                  </div>
                )}
              </div>
            ) : showAcceptedNotice ? (
              <div className="mx-auto w-full max-w-2xl rounded-[1.35rem] bg-secondary p-4 text-center text-sm leading-6 text-muted-foreground">
                <p className="font-semibold text-foreground">
                  You both agreed to keep going.
                </p>
                <p>Two more questions have been added.</p>
              </div>
            ) : null}

            <div className="mx-auto w-full max-w-2xl">
              <VisibilitySelector
                modeLabel={visibility.shortLabel}
                modeCopy={visibility.roomCopy}
              />
            </div>

            <div className="mx-auto w-full max-w-2xl rounded-[1.35rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground md:text-center">
              <p>Chat opens only if you both choose Continue.</p>
              <p>Your answers are not posted anywhere. You can skip any question.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
    );
  }

  if (videoProvider === "livekit") {
    return (
      <LiveKitVideoRoom
        ref={liveKitRoomRef}
        sessionId={sessionId}
        returnHref={matchId ? `/schedule/${matchId}` : "/discover"}
      >
        {renderRoom()}
      </LiveKitVideoRoom>
    );
  }

  return renderRoom();
}

function VideoSetupMessage({
  message,
  returnHref,
}: {
  message: string | null;
  returnHref: string;
}) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center rounded-[1.5rem] bg-muted p-5 text-center text-sm leading-6 text-muted-foreground sm:min-h-44 lg:min-h-72">
      <p>
        {message ??
          "Your video room is being prepared. Try again in a moment."}
      </p>
      <Link
        href={returnHref}
        className="mt-4 rounded-2xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm"
      >
        Return to scheduled session
      </Link>
    </div>
  );
}
