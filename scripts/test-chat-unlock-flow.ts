import { readFileSync } from "node:fs";

const waitingPage = readFileSync(
  "app/(app)/qa/[sessionId]/waiting/page.tsx",
  "utf8",
);

const requiredFragments = [
  '.from("matches")',
  '.update({ status: "unlocked" })',
  '.eq("id", session.match_id)',
  '.from("chats")',
  '.insert({ match_id: session.match_id })',
];

for (const fragment of requiredFragments) {
  if (!waitingPage.includes(fragment)) {
    throw new Error(`Chat unlock flow is missing required transition: ${fragment}`);
  }
}

const statusUpdateIndex = waitingPage.indexOf('.update({ status: "unlocked" })');
const chatInsertIndex = waitingPage.indexOf('.insert({ match_id: session.match_id })');

if (statusUpdateIndex > chatInsertIndex) {
  throw new Error("Match must be marked unlocked before the chat is created.");
}

console.log("Chat unlock flow transitions the match before exposing chat.");
