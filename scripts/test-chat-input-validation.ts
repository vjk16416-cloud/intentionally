import assert from "node:assert/strict";

import {
  CHAT_MESSAGE_MAX_LENGTH,
  parseChatMessageInput,
} from "../lib/chat/validation";

const validChatId = "123e4567-e89b-42d3-a456-426614174000";

assert.equal(CHAT_MESSAGE_MAX_LENGTH, 1000, "Chat messages must retain the existing 1,000-character limit");

assert.deepEqual(
  parseChatMessageInput(validChatId, "  Hello there  "),
  { chatId: validChatId, body: "Hello there" },
  "Valid chat input should be normalised and accepted",
);

assert.equal(parseChatMessageInput("", "Hello"), null, "Blank chat IDs must be rejected");
assert.equal(parseChatMessageInput("not-a-uuid", "Hello"), null, "Malformed chat IDs must be rejected");
assert.equal(parseChatMessageInput(validChatId, "   "), null, "Blank messages must be rejected");
assert.equal(parseChatMessageInput(validChatId, 42), null, "Non-string messages must be rejected");
assert.equal(
  parseChatMessageInput(validChatId, "x".repeat(CHAT_MESSAGE_MAX_LENGTH + 1)),
  null,
  "Messages over the maximum length must be rejected server-side",
);

const maxLengthBody = "x".repeat(CHAT_MESSAGE_MAX_LENGTH);
assert.deepEqual(
  parseChatMessageInput(validChatId, maxLengthBody),
  { chatId: validChatId, body: maxLengthBody },
  "A message exactly at the maximum length should be accepted",
);

console.log("Chat input validation regression checks passed.");
