import { redirect } from "next/navigation";

import { getDiscoverFeed } from "@/lib/discover/feed";
import { createClient } from "@/lib/supabase/server";

import { DiscoverDeck } from "./deck";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const cards = await getDiscoverFeed(supabase, user.id, 20);

  return <DiscoverDeck cards={cards} />;
}
