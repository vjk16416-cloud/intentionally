"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/storage/photos";

const DAILY_LIKE_LIMIT = 20;
const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;

export type MatchedCard = {
  id: string;
  display_name: string;
  date_of_birth: string;
  photo_urls: string[];
};

export type LikeResult =
  | { ok: true; matched: false }
  | { ok: true; matched: true; matchId: string; with: MatchedCard }
  | { ok: false; error: "limit" | "failed" };

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

  const { error: insertError } = await supabase
    .from("swipes")
    .insert({
      swiper_id: user.id,
      swipee_id: swipeeId,
      direction: "like",
    });

  // Unique-violation (already swiped) is treated as a no-op success
  // so a double-tap race doesn't surface as an error.
  if (insertError && insertError.code !== "23505") {
    return { ok: false, error: "failed" };
  }

  // The reciprocal-like trigger may have created a matches row.
  // Canonical match identity is (user_a < user_b).
  const ua = user.id < swipeeId ? user.id : swipeeId;
  const ub = user.id < swipeeId ? swipeeId : user.id;
  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("user_a", ua)
    .eq("user_b", ub)
    .maybeSingle<{ id: string }>();

  if (!match) {
    return { ok: true, matched: false };
  }

  // TODO(posthog): capture `match_created` here.

  const { data: other } = await supabase
    .from("profiles")
    .select("id, display_name, date_of_birth, photos")
    .eq("id", swipeeId)
    .maybeSingle<{
      id: string;
      display_name: string | null;
      date_of_birth: string | null;
      photos: string[] | null;
    }>();

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

  const photo_urls = other.photos.map(
    (path) =>
      supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(path).data
        .publicUrl,
  );

  return {
    ok: true,
    matched: true,
    matchId: match.id,
    with: {
      id: other.id,
      display_name: other.display_name,
      date_of_birth: other.date_of_birth,
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
