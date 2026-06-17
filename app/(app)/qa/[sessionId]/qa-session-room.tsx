"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AnalyticsEvents, trackEvent } from "@/lib/analytics";
import { trackAnalyticsEvent } from "@/lib/analytics/client";
import {
  QA_VISIBILITY_OPTIONS,
  type QaVisibilityMode,
} from "@/lib/qa/visibility";

import { LocalMediaPreview } from "./local-media-preview";
import {
  VisibilitySelector,
  type OpenVideoRequestState,
} from "./visibility-selector";

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
  dailyRoomUrl,
}: QaSessionRoomProps) {
  const router = useRouter();
  const [extraAccepted, setExtraAccepted] = useState(initialExtraAccepted);
  const [extraRequest, setExtraRequest] =
    useState<ExtraRequestState>(initialExtraRequest);
  const [openVideoRequest, setOpenVideoRequest] =
    useState<OpenVideoRequestState>("idle");
  const [isOpenVideo, setIsOpenVideo] = useState(false);
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
  const effectiveVisibilityMode: QaVisibilityMode = isOpenVideo
    ? "open"
    : "dynamic";
  const shouldSoftenYourTile =
    effectiveVisibilityMode === "dynamic" && isThemAnswering;
  const shouldSoftenTheirTile =
    effectiveVisibilityMode === "dynamic" && isYouAnswering;
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
  const visibility = QA_VISIBILITY_OPTIONS[effectiveVisibilityMode];
  const activeSpeakerLabel = isYouAnswering ? "Your turn" : "Their turn";
  const nextActionLabel = isLastQuestion ? "Review choices" : "Next question";
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
    const params = new URLSearchParams({
      started: "true",
      finished: "true",
      visibility: effectiveVisibilityMode,
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
      visibility_mode: effectiveVisibilityMode,
      question_count: questions.length,
      extra_questions: extraAccepted,
      extra_request_state: extraState,
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

  function requestOpenVideo() {
    // TODO: Persist this request to Supabase and broadcast it over realtime so
    // the match can accept or decline from their own session.
    setOpenVideoRequest("pending");
  }

  function previewIncomingOpenVideoRequest() {
    // TODO: Replace this demo-only preview with the match's realtime request.
    setOpenVideoRequest("incoming");
  }

  function allowOpenVideo() {
    // TODO: Activate only after both Supabase consent records are present.
    setIsOpenVideo(true);
    setOpenVideoRequest("idle");
  }

  function keepSoftReveal() {
    setIsOpenVideo(false);
    setOpenVideoRequest("idle");
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background via-[#fbf3e8] to-muted px-4 py-5 text-foreground md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        <section className="overflow-hidden rounded-[2.25rem] border border-[#e6ded0] bg-[#fffaf3] p-4 shadow-[0_24px_80px_rgba(74,59,42,0.12)] md:p-5 lg:p-6">
          <header className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <a
              href="/discover"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-xl text-muted-foreground shadow-sm"
              aria-label="Exit Vibe Check"
            >
              ×
            </a>

            <div className="min-w-0 text-center">
              <p className="text-sm font-semibold tracking-tight">Vibe Check</p>
              <p className="text-[11px] text-muted-foreground">
                A guided conversation, not a performance
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="flex h-10 w-14 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-foreground shadow-sm"
                aria-label="Safety options"
              >
                Safe
              </button>
            </div>
          </header>

          <div className="space-y-4 pt-5 md:space-y-5">
            <div className="rounded-[1.35rem] border border-[#eadfce] bg-background/75 p-3 md:px-4">
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
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Move forward when the answer feels complete. Skipping is always
                okay.
              </p>
            </div>

            <div className="relative grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)_minmax(0,1fr)] md:items-center lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)_minmax(0,1fr)]">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border md:hidden" />

              <div className="relative z-10 rounded-[1.75rem] border border-[#eadfce] bg-background/85 p-3 shadow-sm md:order-1">
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
                )}
              </div>

              <div className="relative z-10 rounded-[1.75rem] border border-[#d8ccbd] bg-[#fff8ef] p-6 text-center shadow-[0_16px_48px_rgba(74,59,42,0.10)] md:order-2 md:p-6 lg:p-8">
                <div className="mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-accent">
                  {safeQuestionIndex + 1}
                </div>
                <h1 className="text-2xl font-semibold leading-8 tracking-tight md:text-3xl md:leading-10">
                  {currentQuestion}
                </h1>
                <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                  There is no perfect answer. Stay honest, kind, and within
                  what feels comfortable.
                </p>
                <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-[#eadfce] bg-background/70 px-4 py-3">
                  <p className="text-xs font-semibold text-foreground">
                    {visibility.shortLabel}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {visibility.roomCopy}
                  </p>
                </div>
              </div>

              <div className="relative z-10 rounded-[1.75rem] border border-[#eadfce] bg-background/85 p-3 shadow-sm md:order-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-card px-3 py-1 text-xs font-semibold">
                    Your match
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                    {theirTileStatus}
                  </span>
                </div>

                {dailyRoomUrl ? (
                  <div className="overflow-hidden rounded-[1.5rem] bg-black">
                    <iframe
                      src={dailyRoomUrl}
                      title="Guided Vibe Check video room"
                      allow="camera; microphone; fullscreen; speaker; display-capture"
                      className={`h-[320px] w-full border-0 transition duration-500 lg:h-[420px] ${
                        shouldSoftenTheirTile
                          ? "scale-105 blur-sm opacity-75"
                          : ""
                      }`}
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
                isOpenVideo={isOpenVideo}
                requestState={openVideoRequest}
                onRequestOpenVideo={requestOpenVideo}
                onPreviewIncomingRequest={previewIncomingOpenVideoRequest}
                onAllowOpenVideo={allowOpenVideo}
                onKeepSoftReveal={keepSoftReveal}
                onReturnToSoftReveal={keepSoftReveal}
              />
            </div>

            <div className="mx-auto grid w-full max-w-md grid-cols-[1fr_auto_1fr] items-center gap-3">
              <button
                type="button"
                onClick={advanceQuestion}
                className="rounded-2xl border border-border bg-background px-4 py-4 text-center text-sm font-semibold text-foreground shadow-sm"
              >
                Skip
              </button>

              <button
                type="button"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground shadow-sm"
                aria-label="Tap to speak"
              >
                Speak
              </button>

              <button
                type="button"
                onClick={answerQuestion}
                className="rounded-2xl bg-accent px-4 py-4 text-center text-sm font-semibold text-accent-foreground shadow-sm"
              >
                {nextActionLabel}
              </button>
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
