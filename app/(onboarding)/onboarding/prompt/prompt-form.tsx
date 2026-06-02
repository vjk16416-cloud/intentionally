"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { BIO_ANSWER_MAX, BIO_PROMPTS } from "@/lib/onboarding/constants";

import { savePrompt, type PromptActionState } from "./actions";

const INITIAL_STATE: PromptActionState = {};

export function PromptForm({
  initialPromptKey,
  initialAnswer,
}: {
  initialPromptKey: string | null;
  initialAnswer: string | null;
}) {
  const [state, action, pending] = useActionState(savePrompt, INITIAL_STATE);
  const [answer, setAnswer] = useState(initialAnswer ?? "");
  const remaining = BIO_ANSWER_MAX - answer.length;

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="promptKey" className="text-sm font-medium">
          Pick a prompt
        </label>
        <select
          id="promptKey"
          name="promptKey"
          defaultValue={initialPromptKey ?? ""}
          required
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
        <label htmlFor="answer" className="text-sm font-medium">
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
          className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Keep it short and honest — under 200 characters."
        />
        <p className="text-xs text-muted-foreground">
          {remaining} character{remaining === 1 ? "" : "s"} left
        </p>
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
