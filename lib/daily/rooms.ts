import "server-only";

import { DAILY_API_KEY, DAILY_API_URL } from "./client";

type DailyRoomResponse = {
  id: string;
  name: string;
  url: string;
};

// Creates a Daily.co room for a Q&A session, server-side. The
// returned name + url get stored on qa_sessions and the url is
// what both participants open when the Q&A starts.
//
// Room properties match §8: no prejoin UI, no Daily chat, no
// screenshare. exp (room expiry) is scheduled_at + 15 minutes per
// the spec — that's the 10-minute session plus a 5-minute buffer
// for late joiners. Step 5b's grace reschedule will widen this if
// needed.
export async function createDailyRoom(
  scheduledAt: Date,
): Promise<{ name: string; url: string }> {
  const expEpoch = Math.floor((scheduledAt.getTime() + 15 * 60_000) / 1000);

  const response = await fetch(`${DAILY_API_URL}/rooms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        enable_prejoin_ui: false,
        enable_chat: false,
        enable_screenshare: false,
        exp: expEpoch,
      },
    }),
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
