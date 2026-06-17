import type { SupabaseClient } from "@supabase/supabase-js";

import { INTERNAL_DEMO_PROFILE_NAMES, isInternalDemoProfile } from "./profiles";

type ProfileRow = {
  id: string;
  display_name: string | null;
};

type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
};

export type InternalDemoResetSummary = {
  demoProfilesFound: number;
  swipesDeleted: number;
  reciprocalSwipesDeleted: number;
  matchesDeleted: number;
};

export async function resetInternalDemoJourney(
  adminClient: SupabaseClient,
  userId: string,
): Promise<InternalDemoResetSummary> {
  const demoNames = Array.from(INTERNAL_DEMO_PROFILE_NAMES);

  const { data: demoProfiles, error: demoProfileError } = await adminClient
    .from("profiles")
    .select("id, display_name")
    .in("display_name", demoNames)
    .returns<ProfileRow[]>();

  if (demoProfileError) {
    throw demoProfileError;
  }

  const internalDemoProfiles =
    demoProfiles?.filter((profile) =>
      isInternalDemoProfile(profile.display_name),
    ) ?? [];

  const demoIds = internalDemoProfiles.map((profile) => profile.id);

  if (demoIds.length === 0) {
    throw new Error("No internal demo profiles were found.");
  }

  const { data: userMatches, error: matchReadError } = await adminClient
    .from("matches")
    .select("id, user_a, user_b")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .returns<MatchRow[]>();

  if (matchReadError) {
    throw matchReadError;
  }

  const demoMatchIds =
    userMatches?.flatMap((match) => {
      const otherId = match.user_a === userId ? match.user_b : match.user_a;
      return demoIds.includes(otherId) ? [match.id] : [];
    }) ?? [];

  const { data: deletedMatches, error: matchDeleteError } =
    demoMatchIds.length > 0
      ? await adminClient
          .from("matches")
          .delete()
          .in("id", demoMatchIds)
          .select("id")
      : { data: [], error: null };

  if (matchDeleteError) {
    throw matchDeleteError;
  }

  const { data: outgoingSwipes, error: outgoingSwipeDeleteError } =
    await adminClient
      .from("swipes")
      .delete()
      .eq("swiper_id", userId)
      .in("swipee_id", demoIds)
      .select("id");

  if (outgoingSwipeDeleteError) {
    throw outgoingSwipeDeleteError;
  }

  const { data: incomingSwipes, error: incomingSwipeDeleteError } =
    await adminClient
      .from("swipes")
      .delete()
      .eq("swipee_id", userId)
      .in("swiper_id", demoIds)
      .select("id");

  if (incomingSwipeDeleteError) {
    throw incomingSwipeDeleteError;
  }

  return {
    demoProfilesFound: demoIds.length,
    swipesDeleted: outgoingSwipes?.length ?? 0,
    reciprocalSwipesDeleted: incomingSwipes?.length ?? 0,
    matchesDeleted: deletedMatches?.length ?? 0,
  };
}
