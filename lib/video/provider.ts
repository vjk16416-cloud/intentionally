export const VIDEO_PROVIDERS = ["daily", "livekit"] as const;

export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];

export type StoredVideoSession = {
  video_provider?: string | null;
  video_room_name?: string | null;
  daily_room_url?: string | null;
  daily_room_name?: string | null;
};

export type ResolvedVideoSession =
  | {
      ok: true;
      provider: "daily";
      roomName: string | null;
      dailyRoomUrl: string;
    }
  | {
      ok: true;
      provider: "livekit";
      roomName: string;
      dailyRoomUrl: null;
    }
  | {
      ok: false;
      provider: VideoProvider | null;
      message: string;
    };

export class VideoProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VideoProviderConfigurationError";
  }
}

export function isVideoProvider(value: unknown): value is VideoProvider {
  return value === "daily" || value === "livekit";
}

export function isQaSessionId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function parseVideoProvider(value: string | undefined): VideoProvider {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) return "daily";
  if (isVideoProvider(normalized)) return normalized;

  throw new VideoProviderConfigurationError(
    'VIDEO_PROVIDER must be either "daily" or "livekit".',
  );
}

export function liveKitRoomName(sessionId: string): string {
  const safeSessionId = sessionId.trim().replace(/[^a-zA-Z0-9_-]/g, "-");

  if (!safeSessionId) {
    throw new VideoProviderConfigurationError(
      "A Q&A session ID is required to reserve a LiveKit room.",
    );
  }

  return `intentionally-qa-${safeSessionId}`;
}

export function resolveStoredVideoSession(
  session: StoredVideoSession,
): ResolvedVideoSession {
  // The migration backfills this field. The legacy fallback is retained so a
  // Daily session remains joinable during a rolling deployment.
  const storedProvider = session.video_provider;
  const provider = isVideoProvider(storedProvider)
    ? storedProvider
    : storedProvider == null && session.daily_room_url
      ? "daily"
      : null;

  if (!provider) {
    return {
      ok: false,
      provider: null,
      message:
        "We couldn\u2019t find the video setup for this Vibe Check. Return to the scheduled session and try again.",
    };
  }

  if (provider === "daily") {
    if (!session.daily_room_url) {
      return {
        ok: false,
        provider,
        message:
          "Your video room is still being prepared. Return to the scheduled session and try again in a moment.",
      };
    }

    return {
      ok: true,
      provider,
      roomName: session.video_room_name ?? session.daily_room_name ?? null,
      dailyRoomUrl: session.daily_room_url,
    };
  }

  if (!session.video_room_name) {
    return {
      ok: false,
      provider,
      message:
        "We couldn\u2019t find the LiveKit room for this Vibe Check. Return to the scheduled session and try again.",
    };
  }

  return {
    ok: true,
    provider,
    roomName: session.video_room_name,
    dailyRoomUrl: null,
  };
}
