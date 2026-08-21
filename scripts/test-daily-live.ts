import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

import {
  buildDailyMeetingTokenPayload,
  buildDailyRoomPayload,
} from "../lib/daily/config";

const DAILY_API_URL = "https://api.daily.co/v1";
const apiKey = process.env.DAILY_API_KEY;

if (!apiKey) {
  throw new Error("Missing required environment variable: DAILY_API_KEY");
}

const roomName = `intentionally-security-${Date.now()}`;
const scheduledAt = new Date(Date.now() + 2 * 60_000);

const headers = {
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
};

async function readJson(response: Response) {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Daily API request failed (${response.status}): ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

let roomCreated = false;

try {
  const createResponse = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: roomName,
      ...buildDailyRoomPayload(scheduledAt),
    }),
  });
  const created = (await readJson(createResponse)) as {
    name?: string;
    privacy?: string;
    url?: string;
    config?: Record<string, unknown>;
  };
  roomCreated = true;

  assert.equal(created.name, roomName);
  assert.equal(created.privacy, "private");
  assert.ok(created.url, "Daily create-room response should include a room URL");

  const getResponse = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
    headers,
  });
  const liveRoom = (await readJson(getResponse)) as {
    privacy?: string;
    config?: Record<string, unknown>;
  };

  assert.equal(liveRoom.privacy, "private");
  assert.equal(liveRoom.config?.max_participants, 2);
  assert.equal(liveRoom.config?.enforce_unique_user_ids, true);
  assert.equal(liveRoom.config?.enable_prejoin_ui, false);
  assert.equal(liveRoom.config?.enable_chat, false);
  assert.equal(liveRoom.config?.enable_screenshare, false);

  const participantId = randomUUID();
  const tokenResponse = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
    method: "POST",
    headers,
    body: JSON.stringify(
      buildDailyMeetingTokenPayload({
        roomName,
        userId: participantId,
        scheduledAt,
      }),
    ),
  });
  const tokenData = (await readJson(tokenResponse)) as { token?: string };

  assert.ok(tokenData.token, "Daily should return a scoped meeting token");
  assert.ok(
    tokenData.token.length > 20,
    "Daily meeting token should be non-empty and token-shaped",
  );

  console.log(
    "Live Daily security check passed: private room config and scoped token verified.",
  );
} finally {
  if (roomCreated) {
    const deleteResponse = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
      method: "DELETE",
      headers,
    });

    if (!deleteResponse.ok) {
      const body = await deleteResponse.text();
      console.error(
        `Daily cleanup failed (${deleteResponse.status}). Test room: ${roomName}. ${body}`,
      );
      process.exitCode = 1;
    }
  }
}
