import { resolveStoredVideoSession, type StoredVideoSession } from "./provider";

export type VideoAccessSession = StoredVideoSession & {
  id: string;
  match_id: string;
  status: string;
  confirmed_at: string | null;
  scheduled_at: string;
  duration_minutes: number;
};

export type VideoAccessMatch = {
  id: string;
  user_a: string;
  user_b: string;
  status: string;
};

export type LiveKitTokenSigner = (input: {
  participantIdentity: string;
  roomName: string;
  ttlSeconds: number;
}) => Promise<string>;

export const LIVEKIT_JOIN_GRACE_SECONDS = 5 * 60;
export const LIVEKIT_MAX_TOKEN_TTL_SECONDS = 20 * 60;

export class VideoAccessError extends Error {
  constructor(
    public readonly code:
      | "unauthenticated"
      | "unavailable"
      | "forbidden"
      | "not_ready"
      | "wrong_provider"
      | "missing_provider_data",
    message: string,
  ) {
    super(message);
    this.name = "VideoAccessError";
  }
}

export async function issueLiveKitParticipantToken({
  userId,
  session,
  match,
  signToken,
  now = new Date(),
}: {
  userId: string | null;
  session: VideoAccessSession | null;
  match: VideoAccessMatch | null;
  signToken: LiveKitTokenSigner;
  now?: Date;
}) {
  if (!userId) {
    throw new VideoAccessError(
      "unauthenticated",
      "Sign in to join this Vibe Check.",
    );
  }

  if (!session || !match || match.id !== session.match_id) {
    throw new VideoAccessError(
      "unavailable",
      "This Vibe Check isn\u2019t available.",
    );
  }

  if (match.user_a !== userId && match.user_b !== userId) {
    throw new VideoAccessError(
      "forbidden",
      "This Vibe Check isn\u2019t available to this account.",
    );
  }

  if (match.status === "closed") {
    throw new VideoAccessError(
      "unavailable",
      "This Vibe Check is no longer available.",
    );
  }

  if (!session.confirmed_at || session.status !== "in_progress") {
    const unavailable =
      session.status === "completed" ||
      session.status === "no_show" ||
      session.status === "cancelled";
    throw new VideoAccessError(
      "not_ready",
      unavailable
        ? "This Vibe Check is no longer available."
        : "This Vibe Check is not ready to join yet.",
    );
  }

  const videoSession = resolveStoredVideoSession(session);
  if (!videoSession.ok) {
    throw new VideoAccessError(
      "missing_provider_data",
      videoSession.message,
    );
  }

  if (videoSession.provider !== "livekit") {
    throw new VideoAccessError(
      "wrong_provider",
      "This Vibe Check uses the Daily video room.",
    );
  }

  const scheduledAt = new Date(session.scheduled_at);
  const durationSeconds = session.duration_minutes * 60;
  const joinClosesAt =
    scheduledAt.getTime() +
    (durationSeconds + LIVEKIT_JOIN_GRACE_SECONDS) * 1_000;
  const secondsUntilJoinCloses = Math.floor(
    (joinClosesAt - now.getTime()) / 1_000,
  );

  if (
    !Number.isFinite(scheduledAt.getTime()) ||
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= 0 ||
    secondsUntilJoinCloses <= 0
  ) {
    throw new VideoAccessError(
      "unavailable",
      "This Vibe Check is no longer available.",
    );
  }

  const ttlSeconds = Math.min(
    LIVEKIT_MAX_TOKEN_TTL_SECONDS,
    secondsUntilJoinCloses,
  );

  const token = await signToken({
    participantIdentity: userId,
    roomName: videoSession.roomName,
    ttlSeconds,
  });

  return {
    token,
    roomName: videoSession.roomName,
    participantIdentity: userId,
  };
}
