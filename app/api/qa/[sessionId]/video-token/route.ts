import "server-only";

import { NextResponse } from "next/server";

import { LiveKitConfigurationError } from "@/lib/livekit/config";
import { getLiveKitConfig } from "@/lib/livekit/server-config";
import { createLiveKitParticipantToken } from "@/lib/livekit/tokens";
import {
  issueLiveKitParticipantToken,
  VideoAccessError,
  type VideoAccessMatch,
  type VideoAccessSession,
} from "@/lib/video/access";
import { isQaSessionId } from "@/lib/video/provider";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonError("Sign in to join this Vibe Check.", 401);
  }

  if (!isQaSessionId(sessionId)) {
    return jsonError("This Vibe Check isn\u2019t available.", 404);
  }

  const { data: session, error: sessionError } = await supabase
    .from("qa_sessions")
    .select(
      "id, match_id, status, confirmed_at, scheduled_at, duration_minutes, video_provider, video_room_name, daily_room_url, daily_room_name",
    )
    .eq("id", sessionId)
    .maybeSingle<VideoAccessSession>();

  if (sessionError) {
    console.error("[qa/video-token] session lookup failed", sessionError.code);
    return jsonError("We couldn\u2019t connect your Vibe Check. Try again.", 500);
  }

  if (!session) {
    return jsonError("This Vibe Check isn\u2019t available.", 404);
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, user_a, user_b, status")
    .eq("id", session.match_id)
    .maybeSingle<VideoAccessMatch>();

  if (matchError) {
    console.error("[qa/video-token] match lookup failed", matchError.code);
    return jsonError("We couldn\u2019t connect your Vibe Check. Try again.", 500);
  }

  try {
    const connection = await issueLiveKitParticipantToken({
      userId: user.id,
      session,
      match,
      signToken: createLiveKitParticipantToken,
    });
    const { serverUrl } = getLiveKitConfig();

    return NextResponse.json(
      {
        serverUrl,
        token: connection.token,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof VideoAccessError) {
      const status =
        error.code === "unauthenticated"
          ? 401
          : error.code === "forbidden"
            ? 403
            : error.code === "not_ready" ||
                error.code === "wrong_provider" ||
                error.code === "missing_provider_data"
              ? 409
              : 404;
      return jsonError(error.message, status);
    }

    if (error instanceof LiveKitConfigurationError) {
      console.error("[qa/video-token] LiveKit configuration missing");
      return jsonError(
        "Live video isn\u2019t configured yet. Return to your scheduled Vibe Check and try again later.",
        503,
      );
    }

    console.error(
      "[qa/video-token] token generation failed",
      error instanceof Error ? error.name : "UnknownError",
    );
    return jsonError(
      "We couldn\u2019t connect your Vibe Check. Please try again.",
      500,
    );
  }
}
