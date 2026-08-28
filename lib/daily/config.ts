const QA_ROOM_DURATION_MS = 15 * 60_000;

type DailyRoomPayload = {
  privacy: "private";
  properties: {
    enable_prejoin_ui: false;
    enable_chat: false;
    enable_screenshare: false;
    max_participants: 2;
    enforce_unique_user_ids: true;
    exp: number;
  };
};

type DailyMeetingTokenPayload = {
  properties: {
    room_name: string;
    user_id: string;
    exp: number;
    eject_at_token_exp: true;
    is_owner: false;
    enable_prejoin_ui: false;
    enable_screenshare: false;
    enable_recording_ui: false;
  };
};

export function dailyExpiryEpoch(scheduledAt: Date) {
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error("Invalid Daily room schedule time.");
  }

  return Math.floor((scheduledAt.getTime() + QA_ROOM_DURATION_MS) / 1000);
}

export function buildDailyRoomPayload(scheduledAt: Date): DailyRoomPayload {
  return {
    privacy: "private",
    properties: {
      enable_prejoin_ui: false,
      enable_chat: false,
      enable_screenshare: false,
      max_participants: 2,
      enforce_unique_user_ids: true,
      exp: dailyExpiryEpoch(scheduledAt),
    },
  };
}

export function buildDailyMeetingTokenPayload({
  roomName,
  userId,
  scheduledAt,
}: {
  roomName: string;
  userId: string;
  scheduledAt: Date;
}): DailyMeetingTokenPayload {
  if (!roomName) throw new Error("Missing Daily room name.");
  if (!userId) throw new Error("Missing Daily participant id.");

  return {
    properties: {
      room_name: roomName,
      user_id: userId,
      exp: dailyExpiryEpoch(scheduledAt),
      eject_at_token_exp: true,
      is_owner: false,
      enable_prejoin_ui: false,
      enable_screenshare: false,
      enable_recording_ui: false,
    },
  };
}

export function buildDailyJoinUrl(roomUrl: string, token: string) {
  if (!roomUrl) throw new Error("Missing Daily room URL.");
  if (!token) throw new Error("Missing Daily meeting token.");

  const url = new URL(roomUrl);
  url.searchParams.set("t", token);
  return url.toString();
}
