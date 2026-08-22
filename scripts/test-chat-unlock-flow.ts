import { readFileSync } from "node:fs";

const waitingPage = readFileSync(
  "app/(app)/qa/[sessionId]/waiting/page.tsx",
  "utf8",
);

const requiredFragments = [
  "const adminClient = admin();",
  "const { data: outcomes } = await adminClient",
  '.rpc("unlock_chat_for_match"',
  "p_match_id: session.match_id",
  "chat_id",
];

for (const fragment of requiredFragments) {
  if (!waitingPage.includes(fragment)) {
    throw new Error(`Chat unlock flow is missing required trusted boundary: ${fragment}`);
  }
}

const forbiddenFragments = [
  "const { data: outcomes } = await supabase",
  '.update({ status: "unlocked" })',
  '.insert({ match_id: session.match_id })',
];

for (const fragment of forbiddenFragments) {
  if (waitingPage.includes(fragment)) {
    throw new Error(`Chat unlock flow bypasses privacy or guarded RPC: ${fragment}`);
  }
}

console.log("Chat unlock flow preserves private outcomes and uses the guarded RPC.");
