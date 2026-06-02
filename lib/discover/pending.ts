import type { createClient } from "@/lib/supabase/server";
import { PROFILE_PHOTOS_BUCKET } from "@/lib/storage/photos";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type PendingMatchOther = {
  id: string;
  display_name: string;
  date_of_birth: string;
  photo_urls: string[];
};

export type PendingMatch = {
  matchId: string;
  other: PendingMatchOther;
};

type RawMatch = {
  id: string;
  user_a: string;
  user_b: string;
};

type OtherProfile = {
  id: string;
  display_name: string | null;
  date_of_birth: string | null;
  photos: string[] | null;
};

// Pending = matches in status 'pending_qa' (Q&A not yet scheduled).
// Returned newest-first so the banner's default "View" opens the
// most recently-formed match. The passive user of any new match
// (the one whose like was older) discovers it through this banner.
export async function getPendingMatches(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<PendingMatch[]> {
  const { data: matches } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("status", "pending_qa")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("created_at", { ascending: false })
    .returns<RawMatch[]>();

  if (!matches || matches.length === 0) return [];

  const otherIds = matches.map((m) =>
    m.user_a === userId ? m.user_b : m.user_a,
  );
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, date_of_birth, photos")
    .in("id", otherIds)
    .returns<OtherProfile[]>();

  const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

  return matches.flatMap((m): PendingMatch[] => {
    const otherId = m.user_a === userId ? m.user_b : m.user_a;
    const p = byId.get(otherId);
    if (
      !p ||
      !p.display_name ||
      !p.date_of_birth ||
      !p.photos ||
      p.photos.length === 0
    ) {
      return [];
    }
    const photo_urls = p.photos.map(
      (path) =>
        supabase.storage.from(PROFILE_PHOTOS_BUCKET).getPublicUrl(path).data
          .publicUrl,
    );
    return [
      {
        matchId: m.id,
        other: {
          id: p.id,
          display_name: p.display_name,
          date_of_birth: p.date_of_birth,
          photo_urls,
        },
      },
    ];
  });
}
