import { redirect } from "next/navigation";

import { getDemoDiscoverCards } from "@/lib/discover/demo";
import { getDiscoverFeed } from "@/lib/discover/feed";
import { getPendingMatches } from "@/lib/discover/pending";
import { createClient } from "@/lib/supabase/server";

import { DiscoverDeck } from "./deck";
import { PendingMatchesBanner } from "./pending-banner";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [realCards, pending, viewerProfile] = await Promise.all([
    getDiscoverFeed(supabase, user.id, 20),
    getPendingMatches(supabase, user.id),
    supabase
      .from("profiles")
      .select("seeking")
      .eq("id", user.id)
      .maybeSingle<{ seeking: string[] | null }>(),
  ]);

  const demoCards = getDemoDiscoverCards(viewerProfile.data?.seeking);
  const isDemoMode = realCards.length === 0;
  const cards = isDemoMode ? demoCards : realCards;

  return (
    <>
      <PendingMatchesBanner pending={pending} />
      <DiscoverDeck cards={cards} isDemoMode={isDemoMode} />
    </>
  );
}
