import { readFileSync } from "node:fs";

const source = readFileSync("app/(app)/discover/deck.tsx", "utf8");

const requiredCopy = [
  "What happens after you match?",
  "If the interest is mutual",
  "guided 10-minute Vibe Check",
  "before chat unlocks",
];

for (const text of requiredCopy) {
  if (!source.includes(text)) {
    throw new Error(`Discover journey is missing required copy: ${text}`);
  }
}

const forbiddenCopy = ["Ready for a Vibe Check?", "Start Vibe Check", "Pass for now"];

for (const text of forbiddenCopy) {
  if (source.includes(text)) {
    throw new Error(`Discover journey still contains premature action: ${text}`);
  }
}

console.log("Discover journey copy matches the staged interaction model.");
