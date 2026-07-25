import "server-only";

import { AccessToken, TrackSource } from "livekit-server-sdk";

import { getLiveKitConfig } from "./server-config";

export const LIVEKIT_TOKEN_TTL_SECONDS = 20 * 60;

export async function createLiveKitParticipantToken({
  participantIdentity,
  roomName,
  ttlSeconds = LIVEKIT_TOKEN_TTL_SECONDS,
}: {
  participantIdentity: string;
  roomName: string;
  ttlSeconds?: number;
}): Promise<string> {
  const { apiKey, apiSecret } = getLiveKitConfig();
  const accessToken = new AccessToken(apiKey, apiSecret, {
    identity: participantIdentity,
    ttl: ttlSeconds,
  });

  accessToken.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE],
    canSubscribe: true,
    canPublishData: false,
    canUpdateOwnMetadata: false,
  });

  return accessToken.toJwt();
}
