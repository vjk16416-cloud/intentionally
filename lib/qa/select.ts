import { QA_QUESTIONS, type Intention, type QaQuestion } from "./questions";

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Pick three Q&A questions for a pair, weighted toward both
// participants' intentions per §6.4. Strict pass first (questions
// suiting BOTH intentions); if that pool is too small, fall back to
// questions suiting at least one. 5a doesn't track which questions
// a user has already seen (Q7 of the plan); Step 5b adds that
// when we have enough sessions for repeat-avoidance to matter.
export function selectThreeQuestions(
  intentions: readonly Intention[],
): QaQuestion[] {
  const dedup = Array.from(new Set(intentions));

  const strict = QA_QUESTIONS.filter((q) =>
    dedup.every((intent) => q.intentions.includes(intent)),
  );
  if (strict.length >= 3) {
    return shuffle(strict).slice(0, 3);
  }

  const lax = QA_QUESTIONS.filter((q) =>
    dedup.some((intent) => q.intentions.includes(intent)),
  );
  return shuffle(lax).slice(0, 3);
}
