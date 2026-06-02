import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Pure DB check — no Stripe SDK dependency. Step 5's Q&A scheduling
// page calls this at its entry point and redirects unverified users
// to /verify. Returning a boolean (not throwing/redirecting) keeps
// the helper composable: the caller decides the routing.
export async function isUserVerified(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("id_verified")
    .eq("id", userId)
    .maybeSingle<{ id_verified: boolean | null }>();

  return Boolean(data?.id_verified);
}
