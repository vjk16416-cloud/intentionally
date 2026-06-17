import type { createClient } from "@/lib/supabase/server";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/storage/photos";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// What the discover deck needs to render and act on a profile card.
export type DiscoverCard = {
  id: string;
  display_name: string;
  date_of_birth: string;
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

  console.log("[discover-feed] diagnostics", {
    currentUserId: diagnostics.userId,
    currentUserCity: diagnostics.viewer.city,
    currentUserGender: diagnostics.viewer.gender,
    currentUserSeeking: diagnostics.viewer.seeking,
    currentUserAvailabilityCount: diagnostics.viewer.availabilityCount,
    profilesBeforeFilters: diagnostics.counts.beforeFilters,
    excludedBySelf: diagnostics.counts.excludedBySelf,
    excludedByPaused: diagnostics.counts.excludedByPaused,
    excludedByCity: diagnostics.counts.excludedByCity,
    excludedByGenderSeeking: diagnostics.counts.excludedByGenderSeeking,
    excludedByAvailability: diagnostics.counts.excludedByAvailability,
    excludedBySwipes: diagnostics.counts.excludedBySwipes,
    finalVisibleCount: diagnostics.counts.finalVisible,
    message: diagnostics.message,
  });
}

async function buildDiscoverDiagnostics({
  supabase,
  userId,
  viewer,
  excludedIds,
  finalVisible,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  viewer: ViewerProfile | null;
  excludedIds: string[];
  finalVisible: number;
}): Promise<DiscoverFeedDiagnostics> {
  if (!viewer) {
    return buildEmptyDiagnostics(userId, null, "No profile row found for current user.");
  }

  if (
    !viewer.city ||
    !viewer.gender ||
    !viewer.seeking ||
    viewer.seeking.length === 0 ||
    !viewer.availability ||
    viewer.availability.length === 0
  ) {
    return buildEmptyDiagnostics(
      userId,
      viewer,
      "Current user is missing a Discover-required field.",
    );
  }

  const { data: profiles, error } = await supabase
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
      Boolean(profile.seeking?.includes(viewer.gender!)),
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

  const counts = {
    beforeFilters,
    excludedBySelf,
    excludedByPaused,
    excludedByCity,
    excludedByGenderSeeking,
    excludedByAvailability,
    excludedBySwipes,
    excludedByIncompleteCard,
    finalVisible,
  };

  const primaryBlocker = Object.entries(counts)
    .filter(([key]) => key.startsWith("excludedBy"))
    .sort(([, a], [, b]) => b - a)[0];

  const message =
    finalVisible > 0
      ? `${finalVisible} profile${finalVisible === 1 ? "" : "s"} visible after filters.`
      : primaryBlocker && primaryBlocker[1] > 0
        ? `Largest exclusion: ${primaryBlocker[0]} removed ${primaryBlocker[1]} profile${primaryBlocker[1] === 1 ? "" : "s"}.`
        : "No profiles reached the diagnostic pool; RLS or upstream visibility may be excluding candidates before Discover filters run.";

  return {
    userId,
    viewer: {
      id: viewer.id,
      city: viewer.city,
      gender: viewer.gender,
      seeking: viewer.seeking,
      availabilityCount: viewer.availability.length,
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
    counts,
    message,
  };
}

// Per §6.2: only show profiles where seeking and gender overlap
// appropriately, where city = viewer's city, where availability
// overlaps the viewer's, and where the viewer hasn't already swiped
// on them. id_verified is NOT a filter — the locked decision is to
// gate verification only at Q&A scheduling.
//
// Availability uses the Postgres array overlap operator (&&) via
// supabase-js .overlaps(). The GIN index added with the column
// makes this cheap. Candidates with NULL availability are naturally
// excluded (NULL && anything is NULL).
//
// Ordering: created_at desc. PostgREST doesn't expose `order by
// random()` directly, and we'd rather not add an RPC just for this
// in MVP. Newest profiles first is a reasonable default; the random-
// shuffle polish lands later.
export async function getDiscoverFeed(
  supabase: SupabaseServerClient,
  userId: string,
  limit = 20,
): Promise<DiscoverCard[]> {
  const result = await getDiscoverFeedWithDiagnostics(supabase, userId, limit);
  return result.cards;
}

export async function getDiscoverFeedWithDiagnostics(
  supabase: SupabaseServerClient,
  userId: string,
  limit = 20,
): Promise<DiscoverFeedResult> {
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
    !viewer.seeking ||
    viewer.seeking.length === 0 ||
    !viewer.availability ||
    viewer.availability.length === 0
  ) {
    // The (app) layout completeness gate should have caught this;
    // bail safely if not.
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

  // Pull the viewer's existing swipes once so we can exclude them
  // from the feed. MVP volume — not worth paginating yet.
  const { data: swipes } = await supabase
    .from("swipes")
    .select("swipee_id")
    .eq("swiper_id", userId);
  const excludedIds = (swipes ?? []).map((s) => s.swipee_id as string);

  let query = supabase
    .from("profiles")
    .select(
      "id, display_name, date_of_birth, intention, bio_prompt_key, bio_answer, city, neighbourhood, availability, id_verified, photos",
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

  // The RLS visibility policy doesn't enforce that profiles in the
  // feed are fully onboarded — only that they're not paused. Filter
  // partial profiles client-side so the deck doesn't render half-
  // shaped cards.
  const cards = candidates.flatMap((p) => {
    if (!hasCompleteCardFields(p)) {
      return [];
    }
    const photoUrls = p.photos.map(
      (path) =>
        supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(path).data
          .publicUrl,
    );
    return [
      {
        id: p.id,
        display_name: p.display_name,
        date_of_birth: p.date_of_birth,
        intention: p.intention,
        bio_prompt_key: p.bio_prompt_key,
        bio_answer: p.bio_answer,
        city: p.city,
        neighbourhood: p.neighbourhood,
        availability: p.availability,
        id_verified: p.id_verified,
        photo_urls: photoUrls,
      },
    ];
  });

  const diagnostics =
    process.env.NODE_ENV === "production"
      ? undefined
      : await buildDiscoverDiagnostics({
          supabase,
          userId,
          viewer,
          excludedIds,
          finalVisible: cards.length,
        });
  if (diagnostics) logDiscoverDiagnostics(diagnostics);

  return { cards, diagnostics };
}
