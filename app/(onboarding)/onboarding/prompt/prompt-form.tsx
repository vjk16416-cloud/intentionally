"use client";

import { useActionState, useState } from "react";

import { StepNav } from "@/components/onboarding/step-nav";
import { BIO_ANSWER_MAX, BIO_PROMPTS } from "@/lib/onboarding/constants";

import { savePrompt, type PromptActionState } from "./actions";

const INITIAL_STATE: PromptActionState = {};

export function PromptForm({
  initialPromptKey,
  initialAnswer,
  returnTo,
  previousStep,
}: {
  initialPromptKey: string | null;
  initialAnswer: string | null;
  returnTo: string | null;
  previousStep: string | null;
}) {
  const [state, action, pending] = useActionState(savePrompt, INITIAL_STATE);
  const [answer, setAnswer] = useState(initialAnswer ?? "");
  const remaining = BIO_ANSWER_MAX - answer.length;

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="promptKey" className="text-sm font-semibold text-foreground">
          Pick a prompt
        </label>
        <select
          id="promptKey"
          name="promptKey"
          defaultValue={initialPromptKey ?? ""}
          required
          className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm shadow-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
        >
          <option value="" disabled>
            Choose one…
          </option>
          {BIO_PROMPTS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.text}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="answer" className="text-sm font-semibold text-foreground">
          Your answer
        </label>
        <textarea
          id="answer"
          name="answer"
          rows={4}
          maxLength={BIO_ANSWER_MAX}
          required
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-6 shadow-sm outline-none focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/30"
          placeholder="Something specific, honest, and easy to reply to."
        />
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground shadow-sm">
          <span>Keep it short and specific.</span>
          <span>{remaining} left</span>
        </div>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <StepNav
        returnTo={returnTo}
        previousStep={previousStep}
        pending={pending}
      />
    </form>
  );
}
