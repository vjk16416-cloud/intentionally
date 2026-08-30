import "server-only";

import { DAILY_API_URL, getDailyApiKey } from "./client";
import {
  buildDailyMeetingTokenPayload,
  buildDailyRoomPayload,
} from "./config";

type DailyRoomResponse = {
  id: string;
  name: string;
  url: string;
};

type DailyMeetingTokenResponse = {
  token: string;
};

function dailyHeaders() {
  return {
    Authorization: `Bearer ${getDailyApiKey()}`,
    "Content-Type": "application/json",
  };
}

// Creates a private Daily room for a Q&A session. The raw room URL is safe to
// store because private rooms reject unauthorised joins; participants receive a
// short-lived, room-scoped meeting token only after Intentionally authenticates
// and authorises them.
export async function createDailyRoom(
  scheduledAt: Date,
): Promise<{ name: string; url: string }> {
  const response = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify(buildDailyRoomPayload(scheduledAt)),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Daily.co room creation failed (${response.status}): ${body}`,
    );
  }

  const room = (await response.json()) as DailyRoomResponse;
  return { name: room.name, url: room.url };
}

export async function createDailyMeetingToken({
  roomName,
  userId,
  scheduledAt,
}: {
  roomName: string;
  userId: string;
  scheduledAt: Date;
}) {
  const response = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify(
      buildDailyMeetingTokenPayload({ roomName, userId, scheduledAt }),
    ),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Daily.co meeting token creation failed (${response.status}): ${body}`,
    );
  }

  const data = (await response.json()) as DailyMeetingTokenResponse;
  if (!data.token) {
    throw new Error("Daily.co meeting token response was missing a token.");
  }

  return data.token;
}
