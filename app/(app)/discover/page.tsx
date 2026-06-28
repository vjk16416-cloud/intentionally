import { redirect } from "next/navigation";

import { getDiscoverFeedWithDiagnostics } from "@/lib/discover/feed";
import { getPendingMatches } from "@/lib/discover/pending";
import { canUseInternalTestingShortcuts } from "@/lib/internal-demo/access";
import { createClient } from "@/lib/supabase/server";

import { DiscoverDeck } from "./deck";
import { InternalTestingShortcuts } from "./internal-testing-shortcuts";
import { PendingMatchesBanner } from "./pending-banner";

export default async function DiscoverPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [feed, pending] = await Promise.all([
    getDiscoverFeedWithDiagnostics(supabase, user.id, 20),
    getPendingMatches(supabase, user.id),
  ]);
  const { cards } = feed;
  const showInternalTestingShortcuts = canUseInternalTestingShortcuts(user.email);

  return (
    <>
      <div id="vibe-checks" className="scroll-mt-24">
        <PendingMatchesBanner pending={pending} />
      </div>
      <DiscoverDeck
        key={cards.length > 0 ? cards.map((card) => card.id).join(",") : "empty"}
        cards={cards}
      />
      {showInternalTestingShortcuts ? <InternalTestingShortcuts /> : null}
    </>
  );
}
