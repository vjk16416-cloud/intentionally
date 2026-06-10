/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useSearchParams } from "next/navigation";

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
  const extraQuestionsAccepted = searchParams.get("extra") === "true";
  const questions = extraQuestionsAccepted
    ? [...QUESTIONS, ...EXTRA_QUESTIONS]
    : QUESTIONS;

  const questionIndex = safeQuestionIndex(searchParams.get("q"), questions.length);
  const finished = searchParams.get("finished") === "true";
  const decision = searchParams.get("decision");
  const extraRequest = searchParams.get("extraRequest");

  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const showExtraQuestionOption =
    !extraQuestionsAccepted && questionIndex >= QUESTIONS.length - 1;

  const nextHref = isLastQuestion
    ? "/qa/demo-demo-match?finished=true"
    : `/qa/demo-demo-match?q=${questionIndex + 1}${
        extraQuestionsAccepted ? "&extra=true&extraRequest=accepted" : ""
      }`;
  const extraStartHref = `/qa/demo-demo-match?q=${QUESTIONS.length}&extra=true&extraRequest=accepted`;
  const extraNotNowHref = "/qa/demo-demo-match?finished=true&extraRequest=declined";

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
                        <a
                          href={extraStartHref}
                          className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground"
                        >
                          They accept
                        </a>
                        <a
                          href={extraNotNowHref}
                          className="rounded-2xl border border-border bg-card px-3 py-3 text-center text-sm font-semibold text-foreground"
                        >
                          Not now
                        </a>
                      </div>
                    </>
                  ) : extraRequest === "incoming" ? (
                    <>
                      <p className="font-semibold text-foreground">
                        Maya wants to add more questions.
                      </p>
                      <p>Only continue if you both want to.</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <a
                          href={extraStartHref}
                          className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground"
                        >
                          Accept
                        </a>
                        <a
                          href={extraNotNowHref}
                          className="rounded-2xl border border-border bg-card px-3 py-3 text-center text-sm font-semibold text-foreground"
                        >
                          Not now
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground">
                        Want to keep going?
                      </p>
                      <p>Add more questions only if you both agree.</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <a
                          href={`/qa/demo-demo-match?q=${questionIndex}&extraRequest=sent`}
                          className="rounded-2xl bg-accent px-3 py-3 text-center text-sm font-semibold text-accent-foreground"
                        >
                          Add more questions
                        </a>
                        <a
                          href={`/qa/demo-demo-match?q=${questionIndex}&extraRequest=incoming`}
                          className="rounded-2xl border border-border bg-card px-3 py-3 text-center text-sm font-semibold text-foreground"
                        >
                          Maya asks
                        </a>
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
                <a
                  href={nextHref}
                  className="block rounded-2xl border border-black bg-white px-4 py-4 text-center text-base font-semibold text-black"
                >
                  Skip
                </a>

                <a
                  href={nextHref}
                  className="block rounded-2xl bg-black px-4 py-4 text-center text-base font-semibold text-white"
                >
                  {isLastQuestion ? "Finish" : "Next"}
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Private decision
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Do you want to keep talking?
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Chat only opens if both people choose to continue.
              </p>

              {decision ? (
                <div className="mt-5 rounded-2xl bg-muted p-4 text-sm">
                  {decision === "continue"
                    ? "You chose to continue. In the real app, we would wait for Maya’s private choice before opening chat."
                    : "You passed privately. In the real app, the match would close quietly."}
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-3">
                  <a
                    href="/qa/demo-demo-match?finished=true&decision=continue"
                    className="block rounded-2xl bg-black px-4 py-4 text-center text-base font-semibold text-white"
                  >
                    Continue
                  </a>

                  <a
                    href="/qa/demo-demo-match?finished=true&decision=pass"
                    className="block rounded-2xl border border-black bg-white px-4 py-4 text-center text-base font-semibold text-black"
                  >
                    Pass privately
                  </a>
                </div>
              )}
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
