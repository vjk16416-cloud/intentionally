import { redirect } from "next/navigation";

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

  const [cards, pending] = await Promise.all([
    getDiscoverFeed(supabase, user.id, 20),
    getPendingMatches(supabase, user.id),
  ]);

  return (
    <>
      <PendingMatchesBanner pending={pending} />
      <DiscoverDeck cards={cards} />
    </>
  );
}
