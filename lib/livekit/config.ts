export type LiveKitConfig = {
  serverUrl: string;
  apiKey: string;
  apiSecret: string;
};

export class LiveKitConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiveKitConfigurationError";
  }
}

type LiveKitEnvironment = {
  LIVEKIT_URL?: string;
  LIVEKIT_API_KEY?: string;
  LIVEKIT_API_SECRET?: string;
  NODE_ENV?: string;
};

export function validateLiveKitConfig(
  environment: LiveKitEnvironment,
): LiveKitConfig {
  const missing = [
    ["LIVEKIT_URL", environment.LIVEKIT_URL],
    ["LIVEKIT_API_KEY", environment.LIVEKIT_API_KEY],
    ["LIVEKIT_API_SECRET", environment.LIVEKIT_API_SECRET],
  ]
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new LiveKitConfigurationError(
      `Missing required LiveKit environment variables: ${missing.join(", ")}`,
    );
  }

  const serverUrl = environment.LIVEKIT_URL!.trim();
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(serverUrl);
  } catch {
    throw new LiveKitConfigurationError(
      "LIVEKIT_URL must be a valid ws:// or wss:// URL.",
    );
  }

  if (parsedUrl.protocol !== "ws:" && parsedUrl.protocol !== "wss:") {
    throw new LiveKitConfigurationError(
      "LIVEKIT_URL must use the ws:// or wss:// protocol.",
    );
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new LiveKitConfigurationError(
      "LIVEKIT_URL must not contain a username or password.",
    );
  }

  const isLocalDevelopmentUrl =
    environment.NODE_ENV !== "production" &&
    parsedUrl.protocol === "ws:" &&
    ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsedUrl.hostname);

  if (parsedUrl.protocol !== "wss:" && !isLocalDevelopmentUrl) {
    throw new LiveKitConfigurationError(
      "LIVEKIT_URL must use wss://. Unencrypted ws:// is only allowed for local development.",
    );
  }

  return {
    serverUrl,
    apiKey: environment.LIVEKIT_API_KEY!.trim(),
    apiSecret: environment.LIVEKIT_API_SECRET!.trim(),
  };
}
