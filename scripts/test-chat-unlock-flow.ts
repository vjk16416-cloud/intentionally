import { readFileSync } from "node:fs";

const waitingPage = readFileSync(
  "app/(app)/qa/[sessionId]/waiting/page.tsx",
  "utf8",
);

const requiredFragments = [
  '.rpc("unlock_chat_for_match"',
  "p_match_id: session.match_id",
  "chat_id",
];

for (const fragment of requiredFragments) {
  if (!waitingPage.includes(fragment)) {
    throw new Error(`Chat unlock flow is missing required guarded unlock: ${fragment}`);
  }
}

const forbiddenFragments = [
  '.update({ status: "unlocked" })',
  '.insert({ match_id: session.match_id })',
];

for (const fragment of forbiddenFragments) {
  if (waitingPage.includes(fragment)) {
    throw new Error(`Chat unlock flow bypasses guarded RPC: ${fragment}`);
  }
}

console.log("Chat unlock flow uses the guarded mutual-Continue RPC.");
