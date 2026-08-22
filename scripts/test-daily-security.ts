import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildDailyJoinUrl,
  buildDailyMeetingTokenPayload,
  buildDailyRoomPayload,
  dailyExpiryEpoch,
} from "../lib/daily/config";

const scheduledAt = new Date("2026-08-21T12:00:00.000Z");
const expectedExpiry = Math.floor(
  (scheduledAt.getTime() + 15 * 60_000) / 1000,
);

assert.equal(dailyExpiryEpoch(scheduledAt), expectedExpiry);

const roomPayload = buildDailyRoomPayload(scheduledAt);
assert.equal(roomPayload.privacy, "private");
assert.equal(roomPayload.properties.max_participants, 2);
assert.equal(roomPayload.properties.enforce_unique_user_ids, true);
assert.equal(roomPayload.properties.enable_chat, false);
assert.equal(roomPayload.properties.enable_screenshare, false);
assert.equal(roomPayload.properties.enable_prejoin_ui, false);
assert.equal(roomPayload.properties.exp, expectedExpiry);

const tokenPayload = buildDailyMeetingTokenPayload({
  roomName: "private-test-room",
  userId: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  scheduledAt,
});
assert.equal(tokenPayload.properties.room_name, "private-test-room");
assert.equal(
  tokenPayload.properties.user_id,
  "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
);
assert.equal(tokenPayload.properties.exp, expectedExpiry);
assert.equal(tokenPayload.properties.eject_at_token_exp, true);
assert.equal(tokenPayload.properties.is_owner, false);
assert.equal(tokenPayload.properties.enable_screenshare, false);
assert.equal(tokenPayload.properties.enable_recording_ui, false);

const joinUrl = buildDailyJoinUrl(
  "https://example.daily.co/private-test-room",
  "header.payload.signature",
);
const parsedJoinUrl = new URL(joinUrl);
assert.equal(parsedJoinUrl.searchParams.get("t"), "header.payload.signature");

const roomsSource = readFileSync("lib/daily/rooms.ts", "utf8");
assert.match(roomsSource, /buildDailyRoomPayload/);
assert.match(roomsSource, /buildDailyMeetingTokenPayload/);
assert.match(roomsSource, /\/meeting-tokens/);

const qaPageSource = readFileSync("app/(app)/qa/[sessionId]/page.tsx", "utf8");
assert.match(qaPageSource, /createDailyMeetingToken/);
assert.match(qaPageSource, /buildDailyJoinUrl/);

const scheduleSource = readFileSync(
  "app/(app)/schedule/[matchId]/actions.ts",
  "utf8",
);
assert.doesNotMatch(scheduleSource, /joinUrl:\s*room\.url/);

const reminderSource = readFileSync(
  "app/api/cron/qa-reminders/route.ts",
  "utf8",
);
assert.doesNotMatch(reminderSource, /joinUrl:\s*session\.daily_room_url/);

console.log("Daily room privacy and token-access regression checks passed.");
