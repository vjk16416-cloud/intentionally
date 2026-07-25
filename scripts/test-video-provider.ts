import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

// Provider boundaries are exercised without contacting Daily, LiveKit, or Supabase.

import { validateLiveKitConfig } from "@/lib/livekit/config";
import {
  issueLiveKitParticipantToken,
  VideoAccessError,
  type LiveKitTokenSigner,
  type VideoAccessMatch,
  type VideoAccessSession,
} from "@/lib/video/access";
import { buildQaJoinUrl } from "@/lib/video/join-url";
import {
  isQaSessionId,
  parseVideoProvider,
  resolveStoredVideoSession,
} from "@/lib/video/provider";

const match: VideoAccessMatch = {
  id: "match-1",
  user_a: "user-a",
  user_b: "user-b",
  status: "qa_scheduled",
};

const liveKitSession: VideoAccessSession = {
  id: "session-1",
  match_id: match.id,
  status: "in_progress",
  confirmed_at: "2026-07-15T10:00:00.000Z",
  scheduled_at: "2026-07-15T10:00:00.000Z",
  duration_minutes: 10,
  video_provider: "livekit",
  video_room_name: "intentionally-qa-session-1",
  daily_room_url: null,
  daily_room_name: null,
};

test("Daily is the configured default", () => {
  assert.equal(parseVideoProvider(undefined), "daily");
  assert.equal(parseVideoProvider(""), "daily");
});

test("only UUID session paths reach the database token lookup", () => {
  assert.equal(
    isQaSessionId("11111111-1111-4111-8111-111111111111"),
    true,
  );
  assert.equal(isQaSessionId("not-a-session-id"), false);
});

test("stored Daily sessions keep using their Daily URL", () => {
  assert.deepEqual(
    resolveStoredVideoSession({
      video_provider: "daily",
      video_room_name: "daily-room",
      daily_room_name: "daily-room",
      daily_room_url: "https://example.daily.co/daily-room",
    }),
    {
      ok: true,
      provider: "daily",
      roomName: "daily-room",
      dailyRoomUrl: "https://example.daily.co/daily-room",
    },
  );
});

test("legacy Daily sessions keep using their stored URL", () => {
  assert.deepEqual(
    resolveStoredVideoSession({
      daily_room_name: "legacy-daily-room",
      daily_room_url: "https://example.daily.co/legacy-daily-room",
    }),
    {
      ok: true,
      provider: "daily",
      roomName: "legacy-daily-room",
      dailyRoomUrl: "https://example.daily.co/legacy-daily-room",
    },
  );
});

test("stored LiveKit sessions keep using their neutral room name", () => {
  assert.deepEqual(resolveStoredVideoSession(liveKitSession), {
    ok: true,
    provider: "livekit",
    roomName: "intentionally-qa-session-1",
    dailyRoomUrl: null,
  });
});

test("missing LiveKit configuration fails clearly", () => {
  assert.throws(
    () => validateLiveKitConfig({}),
    /LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET/,
  );
});

test("LiveKit configuration requires encrypted signalling", () => {
  assert.throws(
    () =>
      validateLiveKitConfig({
        LIVEKIT_URL: "ws://livekit.example",
        LIVEKIT_API_KEY: "key",
        LIVEKIT_API_SECRET: "secret",
        NODE_ENV: "production",
      }),
    /must use wss:\/\//,
  );
  assert.throws(
    () =>
      validateLiveKitConfig({
        LIVEKIT_URL: "wss://user:password@livekit.example",
        LIVEKIT_API_KEY: "key",
        LIVEKIT_API_SECRET: "secret",
      }),
    /must not contain a username or password/,
  );
  assert.equal(
    validateLiveKitConfig({
      LIVEKIT_URL: "ws://localhost:7880",
      LIVEKIT_API_KEY: "key",
      LIVEKIT_API_SECRET: "secret",
      NODE_ENV: "development",
    }).serverUrl,
    "ws://localhost:7880",
  );
  assert.equal(
    validateLiveKitConfig({
      LIVEKIT_URL: "ws://[::1]:7880",
      LIVEKIT_API_KEY: "key",
      LIVEKIT_API_SECRET: "secret",
      NODE_ENV: "development",
    }).serverUrl,
    "ws://[::1]:7880",
  );
});

test("unauthenticated users cannot reach the token signer", async () => {
  let signerCalls = 0;
  const signToken: LiveKitTokenSigner = async () => {
    signerCalls += 1;
    return "mock-token";
  };

  await assert.rejects(
    issueLiveKitParticipantToken({
      userId: null,
      session: liveKitSession,
      match,
      signToken,
    }),
    (error) =>
      error instanceof VideoAccessError && error.code === "unauthenticated",
  );
  assert.equal(signerCalls, 0);
});

test("non-participants cannot reach the token signer", async () => {
  let signerCalls = 0;
  const signToken: LiveKitTokenSigner = async () => {
    signerCalls += 1;
    return "mock-token";
  };

  await assert.rejects(
    issueLiveKitParticipantToken({
      userId: "user-c",
      session: liveKitSession,
      match,
      signToken,
    }),
    (error) => error instanceof VideoAccessError && error.code === "forbidden",
  );
  assert.equal(signerCalls, 0);
});

test("a participant token is signed only after access checks pass", async () => {
  const signedInputs: Array<{
    participantIdentity: string;
    roomName: string;
    ttlSeconds: number;
  }> = [];
  const signToken: LiveKitTokenSigner = async (input) => {
    signedInputs.push(input);
    return "mock-token";
  };

  const result = await issueLiveKitParticipantToken({
    userId: "user-a",
    session: liveKitSession,
    match,
    signToken,
    now: new Date("2026-07-15T10:05:00.000Z"),
  });

  assert.equal(result.token, "mock-token");
  assert.deepEqual(signedInputs, [
    {
      participantIdentity: "user-a",
      roomName: "intentionally-qa-session-1",
      ttlSeconds: 600,
    },
  ]);
});

test("unavailable sessions never reach the token signer", async () => {
  const unavailableSessions: VideoAccessSession[] = [
    { ...liveKitSession, status: "scheduled" },
    { ...liveKitSession, status: "completed" },
    { ...liveKitSession, video_provider: "daily" },
    { ...liveKitSession, video_room_name: null },
  ];

  for (const session of unavailableSessions) {
    let signerCalls = 0;
    await assert.rejects(
      issueLiveKitParticipantToken({
        userId: "user-a",
        session,
        match,
        signToken: async () => {
          signerCalls += 1;
          return "mock-token";
        },
        now: new Date("2026-07-15T10:05:00.000Z"),
      }),
      VideoAccessError,
    );
    assert.equal(signerCalls, 0);
  }
});

test("expired sessions and closed matches cannot mint fresh tokens", async () => {
  for (const scenario of [
    {
      session: liveKitSession,
      scenarioMatch: match,
      now: new Date("2026-07-15T10:15:01.000Z"),
    },
    {
      session: liveKitSession,
      scenarioMatch: { ...match, status: "closed" },
      now: new Date("2026-07-15T10:05:00.000Z"),
    },
  ]) {
    let signerCalls = 0;
    await assert.rejects(
      issueLiveKitParticipantToken({
        userId: "user-a",
        session: scenario.session,
        match: scenario.scenarioMatch,
        signToken: async () => {
          signerCalls += 1;
          return "mock-token";
        },
        now: scenario.now,
      }),
      (error) =>
        error instanceof VideoAccessError && error.code === "unavailable",
    );
    assert.equal(signerCalls, 0);
  }
});

test("participant token lifetime is capped at twenty minutes", async () => {
  let signedTtl = 0;
  await issueLiveKitParticipantToken({
    userId: "user-a",
    session: liveKitSession,
    match,
    signToken: async ({ ttlSeconds }) => {
      signedTtl = ttlSeconds;
      return "mock-token";
    },
    now: new Date("2026-07-15T09:30:00.000Z"),
  });
  assert.equal(signedTtl, 20 * 60);
});

test("scheduled and reminder links return to the authenticated Q&A route", () => {
  assert.equal(
    buildQaJoinUrl("https://intentionally.example/base", "session-1"),
    "https://intentionally.example/qa/session-1",
  );

  const scheduleSource = readFileSync(
    "app/(app)/schedule/[matchId]/actions.ts",
    "utf8",
  );
  const reminderSource = readFileSync(
    "app/api/cron/qa-reminders/route.ts",
    "utf8",
  );

  assert.match(scheduleSource, /const joinUrl = getQaJoinUrl\(updated\.id\)/);
  assert.doesNotMatch(scheduleSource, /joinUrl:\s*room\./);
  assert.match(reminderSource, /joinUrl = getQaJoinUrl\(session\.id\)/);
  assert.doesNotMatch(reminderSource, /session\.daily_room_url/);
});

test("tokens are not persisted and grants exclude data and screen sharing", () => {
  const migrationSource = readFileSync(
    "supabase/migrations/20260715002612_add_video_provider_to_qa_sessions.sql",
    "utf8",
  );
  const scheduleSource = readFileSync(
    "app/(app)/schedule/[matchId]/actions.ts",
    "utf8",
  );
  const tokenSource = readFileSync("lib/livekit/tokens.ts", "utf8");

  assert.doesNotMatch(migrationSource, /token/i);
  assert.doesNotMatch(scheduleSource, /participant_token|livekit_token/i);
  assert.match(tokenSource, /canPublishData:\s*false/);
  assert.match(
    tokenSource,
    /TrackSource\.CAMERA, TrackSource\.MICROPHONE/,
  );
  assert.doesNotMatch(tokenSource, /SCREEN_SHARE/);
});
