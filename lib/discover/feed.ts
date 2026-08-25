import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";

import { computeAge } from "@/lib/age";
import type { createClient } from "@/lib/supabase/server";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/storage/photos";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type DiscoverCard = {
  id: string;
  display_name: string;
  age: number;
  intention: string;
  bio_prompt_key: string;
  bio_answer: string;
  city?: string | null;
  neighbourhood: string;
  availability?: number[] | null;
  id_verified?: boolean | null;
  photo_urls: string[];
};

type ViewerProfile = {
  id: string;
  city: string | null;
  gender: string | null;
  seeking: string[] | null;
  availability: number[] | null;
  paused?: boolean | null;
  id_verified?: boolean | null;
  photos?: string[] | null;
  display_name?: string | null;
  date_of_birth?: string | null;
  intention?: string | null;
  bio_prompt_key?: string | null;
  bio_answer?: string | null;
  neighbourhood?: string | null;
};

type RawProfile = {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  intention: string | null;
  bio_prompt_key: string | null;
  bio_answer: string | null;
  city: string | null;
  neighbourhood: string | null;
  availability: number[] | null;
  id_verified: boolean | null;
  photos: string[] | null;
  gender?: string | null;
  seeking?: string[] | null;
  paused?: boolean | null;
};

type CompleteCardProfile = RawProfile & {
  display_name: string;
  date_of_birth: string;
  intention: string;
  bio_prompt_key: string;
  bio_answer: string;
  neighbourhood: string;
  photos: string[];
};

export type DiscoverFeedDiagnostics = {
  userId: string;
  viewer: {
    id: string | null;
    city: string | null;
    gender: string | null;
    seeking: string[] | null;
    availabilityCount: number;
    paused: boolean | null;
    idVerified: boolean | null;
    photosCount: number;
    hasBioFields: boolean;
  };
  counts: {
    beforeFilters: number;
    excludedBySelf: number;
    excludedByPaused: number;
    excludedByCity: number;
    excludedByGenderSeeking: number;
    excludedByAvailability: number;
    excludedBySwipes: number;
    excludedByIncompleteCard: number;
    finalVisible: number;
  };
  message: string;
};

export type DiscoverFeedResult = {
  cards: DiscoverCard[];
  diagnostics?: DiscoverFeedDiagnostics;
};

function createDiscoverServiceClient() {
  return createSupabaseServiceClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function hasAvailabilityOverlap(
  candidateAvailability: number[] | null | undefined,
  viewerAvailability: number[] | null | undefined,
) {
  if (!candidateAvailability || !viewerAvailability) return false;
  const candidateSlots = new Set(candidateAvailability);
  return viewerAvailability.some((slot) => candidateSlots.has(slot));
}

function hasCompleteCardFields(profile: RawProfile): profile is CompleteCardProfile {
  return Boolean(
    profile.display_name &&
      profile.date_of_birth &&
      profile.intention &&
      profile.bio_prompt_key &&
      profile.bio_answer &&
      profile.neighbourhood &&
      profile.photos &&
      profile.photos.length >= 2,
  );
}

function buildEmptyDiagnostics(
  userId: string,
  viewer: ViewerProfile | null,
  message: string,
): DiscoverFeedDiagnostics {
  return {
    userId,
    viewer: {
      id: viewer?.id ?? null,
      city: viewer?.city ?? null,
      gender: viewer?.gender ?? null,
      seeking: viewer?.seeking ?? null,
      availabilityCount: viewer?.availability?.length ?? 0,
      paused: viewer?.paused ?? null,
      idVerified: viewer?.id_verified ?? null,
      photosCount: viewer?.photos?.length ?? 0,
      hasBioFields: Boolean(
        viewer?.display_name &&
          viewer.date_of_birth &&
          viewer.intention &&
          viewer.bio_prompt_key &&
          viewer.bio_answer &&
          viewer.neighbourhood,
      ),
    },
    counts: {
      beforeFilters: 0,
      excludedBySelf: 0,
      excludedByPaused: 0,
      excludedByCity: 0,
      excludedByGenderSeeking: 0,
      excludedByAvailability: 0,
      excludedBySwipes: 0,
      excludedByIncompleteCard: 0,
      finalVisible: 0,
    },
    message,
  };
}

function logDiscoverDiagnostics(diagnostics: DiscoverFeedDiagnostics) {
  if (process.env.NODE_ENV === "production") return;
  console.log("[discover-feed] diagnostics", diagnostics);
}

async function buildDiscoverDiagnostics({
  userId,
  viewer,
  excludedIds,
  finalVisible,
}: {
  userId: string;
  viewer: ViewerProfile | null;
  excludedIds: string[];
  finalVisible: number;
}): Promise<DiscoverFeedDiagnostics> {
  if (!viewer) return buildEmptyDiagnostics(userId, null, "No profile row found for current user.");

  const service = createDiscoverServiceClient();
  const { data: profiles, error } = await service
    .from("profiles")
    .select(
      "id, display_name, date_of_birth, intention, bio_prompt_key, bio_answer, city, neighbourhood, availability, id_verified, photos, gender, seeking, paused",
    )
    .returns<RawProfile[]>();

  if (error || !profiles) {
    return buildEmptyDiagnostics(
      userId,
      viewer,
      `Unable to read diagnostic profile pool: ${error?.message ?? "No profiles returned."}`,
    );
  }

  let remaining = profiles;
  const beforeFilters = remaining.length;
  remaining = remaining.filter((profile) => profile.id !== viewer.id);
  const excludedBySelf = beforeFilters - remaining.length;
  const beforePaused = remaining.length;
  remaining = remaining.filter((profile) => profile.paused === false);
  const excludedByPaused = beforePaused - remaining.length;
  const beforeCity = remaining.length;
  remaining = remaining.filter((profile) => profile.city === viewer.city);
  const excludedByCity = beforeCity - remaining.length;
  const beforeGenderSeeking = remaining.length;
  remaining = remaining.filter(
    (profile) =>
      Boolean(profile.gender && viewer.seeking?.includes(profile.gender)) &&
      Boolean(profile.seeking?.includes(viewer.gender ?? "")),
  );
  const excludedByGenderSeeking = beforeGenderSeeking - remaining.length;
  const beforeAvailability = remaining.length;
  remaining = remaining.filter((profile) =>
    hasAvailabilityOverlap(profile.availability, viewer.availability),
  );
  const excludedByAvailability = beforeAvailability - remaining.length;
  const beforeSwipes = remaining.length;
  remaining = remaining.filter((profile) => !excludedIds.includes(profile.id));
  const excludedBySwipes = beforeSwipes - remaining.length;
  const beforeCompleteCard = remaining.length;
  remaining = remaining.filter(hasCompleteCardFields);
  const excludedByIncompleteCard = beforeCompleteCard - remaining.length;

  return {
    userId,
    viewer: {
      id: viewer.id,
      city: viewer.city,
      gender: viewer.gender,
      seeking: viewer.seeking,
      availabilityCount: viewer.availability?.length ?? 0,
      paused: viewer.paused ?? null,
      idVerified: viewer.id_verified ?? null,
      photosCount: viewer.photos?.length ?? 0,
      hasBioFields: Boolean(
        viewer.display_name &&
          viewer.date_of_birth &&
          viewer.intention &&
          viewer.bio_prompt_key &&
          viewer.bio_answer &&
          viewer.neighbourhood,
      ),
    },
    counts: {
      beforeFilters,
      excludedBySelf,
      excludedByPaused,
      excludedByCity,
      excludedByGenderSeeking,
      excludedByAvailability,
      excludedBySwipes,
      excludedByIncompleteCard,
      finalVisible,
    },
    message:
      finalVisible > 0
        ? `${finalVisible} profile${finalVisible === 1 ? "" : "s"} visible after filters.`
        : "No profiles are currently visible after Discover filters.",
  };
}

export async function getDiscoverFeed(
  supabase: SupabaseServerClient,
  userId: string,
  limit = 20,
): Promise<DiscoverCard[]> {
  return (await getDiscoverFeedWithDiagnostics(supabase, userId, limit)).cards;
}

export async function getDiscoverFeedWithDiagnostics(
  supabase: SupabaseServerClient,
  userId: string,
  limit = 20,
): Promise<DiscoverFeedResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return { cards: [] };
  }

  const { data: viewer } = await supabase
    .from("profiles")
    .select(
      "id, city, gender, seeking, availability, paused, id_verified, photos, display_name, date_of_birth, intention, bio_prompt_key, bio_answer, neighbourhood",
    )
    .eq("id", userId)
    .maybeSingle<ViewerProfile>();

  if (
    !viewer ||
    !viewer.city ||
    !viewer.gender ||
    !viewer.seeking?.length ||
    !viewer.availability?.length
  ) {
    const diagnostics =
      process.env.NODE_ENV === "production"
        ? undefined
        : buildEmptyDiagnostics(
            userId,
            viewer ?? null,
            "Current user is missing a Discover-required field.",
          );
    if (diagnostics) logDiscoverDiagnostics(diagnostics);
    return { cards: [], diagnostics };
  }

  const { data: swipes } = await supabase
    .from("swipes")
    .select("swipee_id")
    .eq("swiper_id", userId);
  const excludedIds = (swipes ?? []).map((swipe) => swipe.swipee_id as string);

  const service = createDiscoverServiceClient();
  let query = service
    .from("profiles")
    .select(
      "id, display_name, date_of_birth, intention, bio_prompt_key, bio_answer, city, neighbourhood, availability, id_verified, photos, gender, seeking, paused",
    )
    .neq("id", viewer.id)
    .eq("paused", false)
    .eq("city", viewer.city)
    .in("gender", viewer.seeking)
    .contains("seeking", [viewer.gender])
    .overlaps("availability", viewer.availability)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (excludedIds.length > 0) {
    query = query.not("id", "in", `(${excludedIds.join(",")})`);
  }

  const { data: candidates, error } = await query.returns<RawProfile[]>();
  if (error || !candidates) {
    const diagnostics =
      process.env.NODE_ENV === "production"
        ? undefined
        : buildEmptyDiagnostics(
            userId,
            viewer,
            `Discover query failed: ${error?.message ?? "No candidates returned."}`,
          );
    if (diagnostics) logDiscoverDiagnostics(diagnostics);
    return { cards: [], diagnostics };
  }

  const cards = (
    await Promise.all(
      candidates.map(async (profile): Promise<DiscoverCard | null> => {
        if (!hasCompleteCardFields(profile)) return null;

        const photoUrls = await Promise.all(
          profile.photos.map(async (path) => {
            const { data, error: photoError } = await service.storage
              .from(PROFILE_PHOTOS_BUCKET)
              .createSignedUrl(path, 60 * 10);
            return photoError ? null : data.signedUrl;
          }),
        );
        const usablePhotos = photoUrls.filter((url): url is string => Boolean(url));
        if (usablePhotos.length < 2) return null;

        return {
          id: profile.id,
          display_name: profile.display_name,
          age: computeAge(profile.date_of_birth),
          intention: profile.intention,
          bio_prompt_key: profile.bio_prompt_key,
          bio_answer: profile.bio_answer,
          city: profile.city,
          neighbourhood: profile.neighbourhood,
          availability: profile.availability,
          id_verified: profile.id_verified,
          photo_urls: usablePhotos,
        };
      }),
    )
  ).filter((card): card is DiscoverCard => card !== null);

  const diagnostics =
    process.env.NODE_ENV === "production"
      ? undefined
      : await buildDiscoverDiagnostics({
          userId,
          viewer,
          excludedIds,
          finalVisible: cards.length,
        });
  if (diagnostics) logDiscoverDiagnostics(diagnostics);

  return { cards, diagnostics };
}
