export const CHAT_MESSAGE_MAX_LENGTH = 1000;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseChatMessageInput(chatId: unknown, body: unknown) {
  if (typeof chatId !== "string" || typeof body !== "string") {
    return null;
  }

  const normalizedChatId = chatId.trim();
  const normalizedBody = body.trim();

  if (!UUID_PATTERN.test(normalizedChatId)) {
    return null;
  }

  if (
    !normalizedBody ||
    normalizedBody.length > CHAT_MESSAGE_MAX_LENGTH
  ) {
    return null;
  }

  return {
    chatId: normalizedChatId,
    body: normalizedBody,
  };
}
