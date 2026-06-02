import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { isUserVerified } from "@/lib/verification";

type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
  status: string;
};

type OtherProfile = {
  display_name: string | null;
};

// Step-4 stub for the eventual Q&A scheduling flow (Step 5 replaces
// this with the real availability picker). Three jobs:
//
// 1. Confirm the viewer owns the match (RLS does the heavy lifting;
//    a non-owner gets no row and we 404).
// 2. Enforce the ID-verification gate — this is the moment Step 3
//    was built for. Unverified viewers bounce to /verify with a
//    return path that lands them back here after they pass.
// 3. Render a placeholder so the verified viewer sees something
//    other than a blank route.

export default async function ScheduleStubPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b, status")
    .eq("id", matchId)
    .maybeSingle<MatchRow>();

  if (!match) {
    notFound();
  }

  const verified = await isUserVerified(supabase, user.id);
  if (!verified) {
    redirect(`/verify?return=/schedule/${matchId}`);
  }

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: other } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", otherId)
    .maybeSingle<OtherProfile>();

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-4 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Schedule your Q&amp;A
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Coming in Step 5
        </h1>
        {other?.display_name ? (
          <p className="text-sm text-muted-foreground">
            You matched with {other.display_name}. The availability picker
            and Q&amp;A scheduling flow lands in the next step. Your ID is
            verified — you&apos;re ready.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            The availability picker and Q&amp;A scheduling flow lands in the
            next step. Your ID is verified — you&apos;re ready.
          </p>
        )}
      </div>
    </main>
  );
}
