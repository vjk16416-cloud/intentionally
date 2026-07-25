export function buildQaJoinUrl(
  appUrl: string | undefined,
  sessionId: string,
): string {
  if (!appUrl) {
    throw new Error("Missing required environment variable: APP_URL");
  }

  let origin: URL;
  try {
    origin = new URL(appUrl);
  } catch {
    throw new Error("APP_URL must be a valid absolute URL.");
  }

  if (origin.protocol !== "http:" && origin.protocol !== "https:") {
    throw new Error("APP_URL must use http or https.");
  }

  return new URL(`/qa/${encodeURIComponent(sessionId)}`, origin).toString();
}

export function getQaJoinUrl(sessionId: string): string {
  return buildQaJoinUrl(process.env.APP_URL, sessionId);
}
