"use server";

import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { computeAge } from "@/lib/age";
import {
  getInternalDemoOrdinal,
  isInternalDemoProfile,
  shouldAutoMatchInternalDemoProfile,
} from "@/lib/internal-demo/profiles";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/storage/photos";

const DAILY_LIKE_LIMIT = 20;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

export type MatchedCard = {
  id: string;
  display_name: string;
  age: number;
  photo_urls: string[];
};

export type LikeResult =
  | { ok: true; matched: false }
  | { ok: true; matched: true; matchId: string; with: MatchedCard }
  | { ok: false; error: "limit" | "failed" };

function admin() {
  return createServiceRoleClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

type DemoProfile = {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  photos: string[] | null;
};

type SwipeRow = {
  id: string;
  direction: string;
};

type ExistingMatchRow = {
  id: string;
};

type DemoReciprocalResult = {
  reciprocalCreated: boolean;
};

function matchPair(userId: string, swipeeId: string) {
  return {
    user_a: userId < swipeeId ? userId : swipeeId,
    user_b: userId < swipeeId ? swipeeId : userId,
  };
}

async function findExistingMatch(
  adminClient: ReturnType<typeof admin>,
  userId: string,
  swipeeId: string,
) {
  const { user_a, user_b } = matchPair(userId, swipeeId);
  const { data, error } = await adminClient
    .from("matches")
    .select("id")
    .eq("user_a", user_a)
    .eq("user_b", user_b)
    .maybeSingle<ExistingMatchRow>();

  if (error) {
    throw error;
  }

  return data;
}

async function deleteDemoPairState(userId: string, swipeeId: string) {
  const adminClient = admin();
  const { user_a, user_b } = matchPair(userId, swipeeId);

  const { error: matchDeleteError } = await adminClient
    .from("matches")
    .delete()
    .eq("user_a", user_a)
    .eq("user_b", user_b);

  if (matchDeleteError) {
    throw matchDeleteError;
  }

  const { error: reciprocalDeleteError } = await adminClient
    .from("swipes")
    .delete()
    .eq("swiper_id", swipeeId)
    .eq("swipee_id", userId);

  if (reciprocalDeleteError) {
    throw reciprocalDeleteError;
  }
}

function logInternalDemoLike(details: {
  displayName: string;
  ordinal: number | null;
  shouldAutoMatch: boolean;
  existingMatchBeforeSynthetic: boolean;
  reciprocalCreated: boolean;
  matchExistsAfterLike: boolean;
  returnedMatched: boolean;
  returnedMatchId: string | null;
}) {
  if (process.env.NODE_ENV === "production") return;

  console.log("[internal-demo-like]", {
    likedProfileDisplayName: details.displayName,
    demoOrdinal: details.ordinal,
    shouldAutoMatch: details.shouldAutoMatch,
    existingMatchBeforeSynthetic: details.existingMatchBeforeSynthetic,
    reciprocalDemoLikeCreated: details.reciprocalCreated,
    matchRowExistsAfterLike: details.matchExistsAfterLike,
    returnedMatched: details.returnedMatched,
    returnedMatchId: details.returnedMatchId,
  });
}

async function ensureSwipeLike(
  supabase: Awaited<ReturnType<typeof createClient>>,
  swiperId: string,
  swipeeId: string,
) {
  const { error } = await supabase.from("swipes").insert({
    swiper_id: swiperId,
    swipee_id: swipeeId,
    direction: "like",
  });

  if (error && error.code !== "23505") {
    throw error;
  }
}

async function ensureDemoReciprocalMatch(
  userId: string,
  swipeeId: string,
): Promise<DemoReciprocalResult> {
  const adminClient = admin();
  let reciprocalCreated = false;

  // Internal demo/testing only: synthesize a reciprocal like for the
  // seeded demo profiles that are meant to auto-match. This keeps the
  // real user flow unchanged while making the demo journey usable.
  const { data: existingSwipe, error: swipeReadError } = await adminClient
    .from("swipes")
    .select("id, direction")
    .eq("swiper_id", swipeeId)
    .eq("swipee_id", userId)
    .maybeSingle<SwipeRow>();

  if (swipeReadError) {
    throw swipeReadError;
  }

  if (!existingSwipe) {
    const { error: insertError } = await adminClient.from("swipes").insert({
      swiper_id: swipeeId,
      swipee_id: userId,
      direction: "like",
    });

    if (insertError && insertError.code !== "23505") {
      throw insertError;
    }

    reciprocalCreated = true;
  } else if (existingSwipe.direction !== "like") {
    const { error: updateError } = await adminClient
      .from("swipes")
      .update({ direction: "like" })
      .eq("id", existingSwipe.id);

    if (updateError) {
      throw updateError;
    }
  }

  const { user_a, user_b } = matchPair(userId, swipeeId);

  const { error: matchInsertError } = await adminClient.from("matches").insert({
    user_a,
    user_b,
  });

  if (matchInsertError && matchInsertError.code !== "23505") {
    throw matchInsertError;
  }

  return { reciprocalCreated };
}

export async function likeProfile(swipeeId: string): Promise<LikeResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // TODO(posthog): capture `swipe_like` here. Wires up in the
  // PostHog commit pinned to Step 5.

  // 20-likes-per-24h rolling window (§6.2). Passes are unlimited.
  const cutoff = new Date(Date.now() - DAILY_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from("swipes")
    .select("id", { count: "exact", head: true })
    .eq("swiper_id", user.id)
    .eq("direction", "like")
    .gte("created_at", cutoff);

  if ((count ?? 0) >= DAILY_LIKE_LIMIT) {
    return { ok: false, error: "limit" };
  }

  const adminClient = admin();
  const { data: other } = await adminClient
    .from("profiles")
    .select("id, display_name, date_of_birth, photos")
    .eq("id", swipeeId)
    .maybeSingle<DemoProfile>();

  const demoOrdinal = getInternalDemoOrdinal(other?.display_name);
  const shouldAutoMatch =
    demoOrdinal !== null &&
    shouldAutoMatchInternalDemoProfile(other?.display_name);
  const isDemoProfile = demoOrdinal !== null;

  if (isDemoProfile && !shouldAutoMatch) {
    try {
      await deleteDemoPairState(user.id, swipeeId);
    } catch {
      return { ok: false, error: "failed" };
    }
  }

  try {
    await ensureSwipeLike(supabase, user.id, swipeeId);
  } catch {
    return { ok: false, error: "failed" };
  }

  if (
    !other ||
    !other.display_name ||
    !other.date_of_birth ||
    !other.photos ||
    other.photos.length < 1
  ) {
    // Match exists but the other side's data isn't renderable. Don't
    // error — just skip the modal this round.
    return { ok: true, matched: false };
  }

  let reciprocalCreated = false;
  let existingMatchBeforeSynthetic = false;

  if (isInternalDemoProfile(other.display_name)) {
    try {
      existingMatchBeforeSynthetic = Boolean(
        await findExistingMatch(admin(), user.id, swipeeId),
      );
    } catch {
      return { ok: false, error: "failed" };
    }

    if (shouldAutoMatch) {
      try {
        const result = await ensureDemoReciprocalMatch(user.id, swipeeId);
        reciprocalCreated = result.reciprocalCreated;
      } catch {
        return { ok: false, error: "failed" };
      }
    }
  }

  // The reciprocal-like trigger or the demo helper may have created
  // a matches row. Canonical match identity is (user_a < user_b).
  const { user_a: ua, user_b: ub } = matchPair(user.id, swipeeId);
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("user_a", ua)
    .eq("user_b", ub)
    .maybeSingle<{ id: string }>();

  if (isInternalDemoProfile(other.display_name)) {
    if (!shouldAutoMatch && match) {
      try {
        await deleteDemoPairState(user.id, swipeeId);
      } catch {
        return { ok: false, error: "failed" };
      }

      logInternalDemoLike({
        displayName: other.display_name,
        ordinal: demoOrdinal,
        shouldAutoMatch,
        existingMatchBeforeSynthetic,
        reciprocalCreated,
        matchExistsAfterLike: false,
        returnedMatched: false,
        returnedMatchId: null,
      });

      return { ok: true, matched: false };
    }
  }

  if (isInternalDemoProfile(other.display_name)) {
    logInternalDemoLike({
      displayName: other.display_name,
      ordinal: demoOrdinal,
      shouldAutoMatch,
      existingMatchBeforeSynthetic,
      reciprocalCreated,
      matchExistsAfterLike: Boolean(match),
      returnedMatched: Boolean(match),
      returnedMatchId: match?.id ?? null,
    });
  }

  if (!match) {
    return { ok: true, matched: false };
  }

  // TODO(posthog): capture `match_created` here.

  const photo_urls = (
    await Promise.all(
      other.photos.map(async (path) => {
        const { data, error } = await adminClient.storage
          .from(PROFILE_PHOTOS_BUCKET)
          .createSignedUrl(path, 60 * 10);
        return error ? null : data.signedUrl;
      }),
    )
  ).filter((url): url is string => Boolean(url));

  return {
    ok: true,
    matched: true,
    matchId: match.id,
    with: {
      id: other.id,
      display_name: other.display_name,
      age: computeAge(other.date_of_birth),
      photo_urls,
    },
  };
}

export async function passProfile(swipeeId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // TODO(posthog): capture `swipe_pass` here.

  // Fire-and-forget. A duplicate (already passed) is a no-op; the
  // deck just moves on.
  await supabase
    .from("swipes")
    .insert({
      swiper_id: user.id,
      swipee_id: swipeeId,
      direction: "pass",
    });
}
