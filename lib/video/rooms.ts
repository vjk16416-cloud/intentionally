import "server-only";

import { getLiveKitConfig } from "@/lib/livekit/server-config";

import {
  liveKitRoomName,
  parseVideoProvider,
  type VideoProvider,
} from "./provider";

export type VideoRoomReservation =
  | {
      provider: "daily";
      roomName: string;
      dailyRoomName: string;
      dailyRoomUrl: string;
    }
  | {
      provider: "livekit";
      roomName: string;
      dailyRoomName: null;
      dailyRoomUrl: null;
    };

export function getConfiguredVideoProvider(): VideoProvider {
  return parseVideoProvider(process.env.VIDEO_PROVIDER);
}

export async function reserveVideoRoom({
  sessionId,
  scheduledAt,
  provider = getConfiguredVideoProvider(),
}: {
  sessionId: string;
  scheduledAt: Date;
  provider?: VideoProvider;
}): Promise<VideoRoomReservation> {
  if (provider === "daily") {
    const { createDailyRoom } = await import("@/lib/daily/rooms");
    const room = await createDailyRoom(scheduledAt);

    return {
      provider,
      roomName: room.name,
      dailyRoomName: room.name,
      dailyRoomUrl: room.url,
    };
  }

  // Validate server configuration at confirmation time. LiveKit creates the
  // deterministic room when the first authorised participant joins.
  getLiveKitConfig();

  return {
    provider,
    roomName: liveKitRoomName(sessionId),
    dailyRoomName: null,
    dailyRoomUrl: null,
  };
}

export function videoReservationErrorMessage(provider: VideoProvider | null) {
  if (provider === "livekit") {
    return "We couldn\u2019t prepare the LiveKit room because video setup is incomplete. Try again after the server settings are checked.";
  }

  if (provider === "daily") {
    return "We couldn\u2019t reserve the Daily video room. Try again in a moment.";
  }

  return "We couldn\u2019t determine which video provider to use. Check VIDEO_PROVIDER and try again.";
}
