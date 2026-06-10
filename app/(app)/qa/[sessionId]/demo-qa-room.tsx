/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

const QUESTIONS = [
  "What is something you value in how someone communicates?",
  "What does effort look like to you in early dating?",
  "What would make a first conversation feel genuinely comfortable?",
];

const EXTRA_QUESTIONS = [
  "What would make dating feel healthier for you?",
  "What helps you feel safe opening up to someone?",
];

function safeQuestionIndex(value: string | null, total: number) {
  const parsed = Number(value ?? "0");
  const maxIndex = Math.max(total - 1, 0);

  if (!Number.isFinite(parsed)) return 0;
  if (parsed < 0) return 0;
  if (parsed > maxIndex) return maxIndex;

  return parsed;
}

export default function DemoQaRoom() {
  const searchParams = useSearchParams();
  const [extraQuestionsAccepted, setExtraQuestionsAccepted] = useState(
    searchParams.get("extra") === "true",
  );
  const questions = extraQuestionsAccepted
    ? [...QUESTIONS, ...EXTRA_QUESTIONS]
    : QUESTIONS;

  const [questionIndex, setQuestionIndex] = useState(() =>
    safeQuestionIndex(searchParams.get("q"), questions.length),
  );
  const [finished, setFinished] = useState(
    searchParams.get("finished") === "true",
  );
  const decision = searchParams.get("decision");
  const [extraRequest, setExtraRequest] = useState(
    searchParams.get("extraRequest") ?? "",
  );

  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const showExtraQuestionOption =
    !extraQuestionsAccepted && questionIndex >= QUESTIONS.length - 1;

  function goToNextQuestion() {
    if (isLastQuestion) {
      setFinished(true);
      return;
    }

    setQuestionIndex((current) =>
      safeQuestionIndex(String(current + 1), questions.length),
    );
  }

  function acceptExtraQuestions() {
    setExtraQuestionsAccepted(true);
    setExtraRequest("accepted");
    setQuestionIndex(QUESTIONS.length);
  }

  function declineExtraQuestions() {
    setExtraRequest("declined");
    setFinished(true);
  }

  return (
    <main className="min-h-[calc(100vh-57px)] bg-gradient-to-b from-background to-muted px-4 py-5">
      <div className="mx-auto w-full max-w-md space-y-5 md:max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
              Demo Q&amp;A room
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

        <section className="rounded-[2rem] bg-neutral-950 p-3 text-white shadow-xl">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(280px,360px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(340px,440px)_minmax(0,1fr)]">
            <div className="flex min-h-48 flex-col justify-between rounded-[1.5rem] bg-neutral-800 p-3 md:order-1">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                  You
                </span>
                <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">
                  Live
                </span>
              </div>

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

            <div className="rounded-[1.5rem] bg-white p-5 text-center text-black md:order-2">
              <p className="text-xs uppercase tracking-[0.22em] text-black/45">
                Question {questionIndex + 1} of {questions.length}
              </p>
              <h2 className="mt-3 text-2xl font-semibold leading-8 tracking-tight">
                {currentQuestion}
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/60">
                No perfect answer. Just be honest.
              </p>
            </div>

            <div className="flex min-h-48 flex-col justify-between rounded-[1.5rem] bg-neutral-800/80 p-3 md:order-3">
              <div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                  Maya
                </span>
              </div>

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-semibold">
                M
              </div>

              <div className="rounded-2xl bg-white p-3 text-black">
                <p className="text-xs font-semibold">Listening mode</p>
                <p className="mt-1 text-xs leading-5 text-black/60">
                  Listener softens while someone answers.
                </p>
              </div>
            </div>
          </div>
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

              {showExtraQuestionOption ? (
                <div className="mt-5 rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                  {extraRequest === "sent" ? (
                    <>
                      <p className="font-semibold text-foreground">
                        Request sent
                      </p>
                      <p>We&apos;ll only add more if you both agree.</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={acceptExtraQuestions}
                          className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground"
                        >
                          They accept
                        </button>
                        <button
                          type="button"
                          onClick={declineExtraQuestions}
                          className="rounded-2xl border border-border bg-card px-3 py-3 text-center text-sm font-semibold text-foreground"
                        >
                          Not now
                        </button>
                      </div>
                    </>
                  ) : extraRequest === "incoming" ? (
                    <>
                      <p className="font-semibold text-foreground">
                        Maya wants to add more questions.
                      </p>
                      <p>Only continue if you both want to.</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={acceptExtraQuestions}
                          className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={declineExtraQuestions}
                          className="rounded-2xl border border-border bg-card px-3 py-3 text-center text-sm font-semibold text-foreground"
                        >
                          Not now
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground">
                        Want to keep going?
                      </p>
                      <p>Add more questions only if you both agree.</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setExtraRequest("sent")}
                          className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground"
                        >
                          Add more questions
                        </button>
                        <button
                          type="button"
                          onClick={() => setExtraRequest("incoming")}
                          className="rounded-2xl border border-border bg-card px-3 py-3 text-center text-sm font-semibold text-foreground"
                        >
                          Maya asks
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : extraQuestionsAccepted && questionIndex === QUESTIONS.length ? (
                <div className="mt-5 rounded-2xl bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    You both agreed to keep going.
                  </p>
                  <p>Adding 2 more questions.</p>
                </div>
              ) : null}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={goToNextQuestion}
                  className="block rounded-2xl border border-black bg-white px-4 py-4 text-center text-base font-semibold text-black"
                >
                  Skip
                </button>

                <button
                  type="button"
                  onClick={goToNextQuestion}
                  className="block rounded-2xl bg-black px-4 py-4 text-center text-base font-semibold text-white"
                >
                  {isLastQuestion ? "Finish" : "Next"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Private decision
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Choose what feels right
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your choice stays private. They&apos;ll only know if you both
                choose Continue.
              </p>

              {decision ? (
                <div className="mt-5 rounded-[1.5rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
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
              ) : (
                <div className="mt-6 space-y-4">
                  <div className="grid gap-3 rounded-[1.5rem] bg-background p-4 text-sm leading-6 text-muted-foreground">
                    <p>Choose Continue if you&apos;d like to keep talking.</p>
                    <p>Choose Pass privately if it doesn&apos;t feel right.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                  <a
                    href="/qa/demo-demo-match?finished=true&decision=continue"
                    className="block rounded-2xl bg-accent px-4 py-4 text-center text-base font-semibold text-accent-foreground"
                  >
                    Continue
                  </a>

                  <a
                    href="/qa/demo-demo-match?finished=true&decision=pass"
                    className="block rounded-2xl border border-[#d9a6a0]/40 bg-[#f3d8d3] px-4 py-4 text-center text-base font-semibold text-[#5a2d2a]"
                  >
                    Pass privately
                  </a>
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-[1.5rem] bg-secondary p-4 text-sm leading-6 text-muted-foreground">
                No awkward notifications. No pressure. Full profiles unlock
                only if you both choose Continue.
              </div>
            </>
          )}
        </section>

        <a
          href="/discover"
          className="block rounded-2xl bg-black px-4 py-4 text-center text-base font-semibold text-white"
        >
          Back to Discover
        </a>
      </div>
    </main>
  );
}
