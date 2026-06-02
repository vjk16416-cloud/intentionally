import type { createClient } from "@/lib/supabase/server";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/storage/photos";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// What the discover deck needs to render and act on a profile card.
// Strings only — easy to serialise from the server component to the
// client deck.
export type DiscoverCard = {
  id: string;
  display_name: string;
  date_of_birth: string;
  intention: string;
  bio_prompt_key: string;
  bio_answer: string;
  neighbourhood: string;
  photo_urls: string[];
};

type ViewerProfile = {
  id: string;
  city: string | null;
  gender: string | null;
  seeking: string[] | null;
  availability: number[] | null;
};

type RawProfile = {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  intention: string | null;
  bio_prompt_key: string | null;
  bio_answer: string | null;
  neighbourhood: string | null;
  photos: string[] | null;
};

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
  const { data: viewer } = await supabase
    .from("profiles")
    .select("id, city, gender, seeking, availability")
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
    return [];
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
      "id, display_name, date_of_birth, intention, bio_prompt_key, bio_answer, neighbourhood, photos",
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
    return [];
  }

  // The RLS visibility policy doesn't enforce that profiles in the
  // feed are fully onboarded — only that they're not paused. Filter
  // partial profiles client-side so the deck doesn't render half-
  // shaped cards.
  return candidates.flatMap((p) => {
    if (
      !p.display_name ||
      !p.date_of_birth ||
      !p.intention ||
      !p.bio_prompt_key ||
      !p.bio_answer ||
      !p.neighbourhood ||
      !p.photos ||
      p.photos.length < 2
    ) {
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
        neighbourhood: p.neighbourhood,
        photo_urls: photoUrls,
      },
    ];
  });
}
