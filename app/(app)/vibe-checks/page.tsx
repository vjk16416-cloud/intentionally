import Link from "next/link";
import { redirect } from "next/navigation";

import { getPendingMatches } from "@/lib/discover/pending";
import { createClient } from "@/lib/supabase/server";

import { PendingMatchesBanner } from "../discover/pending-banner";

export default async function VibeChecksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const pending = await getPendingMatches(supabase, user.id);

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-[#eadfce] bg-[#fffaf4] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a7c70]">
          Vibe Checks
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#3d342d]">
          Your guided conversations
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6f6258]">
          See pending invites for approximately 10-minute Vibe Checks with
          Soft Reveal. Chat opens only if you both privately choose Continue.
        </p>
      </section>

      <PendingMatchesBanner pending={pending} />

      {pending.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-[#d8cbbb] bg-white/80 p-5 text-sm text-[#6f6258]">
          <p className="font-semibold text-[#3d342d]">
            No Vibe Checks waiting right now
          </p>
          <p className="mt-2">
            You&apos;re all caught up. Discover is the best place to find someone
            you may want to invite when the fit feels right.
          </p>
          <Link
            href="/discover"
            className="mt-4 inline-flex rounded-full bg-[#6f8f72] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Discover
          </Link>
        </section>
      ) : null}
    </main>
  );
}
