import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { computeMutualSlots } from "@/lib/scheduling/slots";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { isUserVerified } from "@/lib/verification";

import { ConfirmButtons } from "./confirm-buttons";
import { SlotPicker } from "./slot-picker";

type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
  status: string;
};

type QaSessionRow = {
  id: string;
  scheduled_at: string;
  proposed_at: string;
  proposed_by_id: string;
  confirmed_at: string | null;
};

type ParticipantProfile = {
  id: string;
  display_name: string | null;
  availability: number[] | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  hour: "numeric",
  minute: "2-digit",
  day: "numeric",
  month: "long",
  hour12: true,
  timeZone: "Europe/London",
});

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b, status")
    .eq("id", matchId)
    .maybeSingle<MatchRow>();
  if (!match) notFound();

  if (!(await isUserVerified(supabase, user.id))) {
    redirect(`/verify?return=/schedule/${matchId}`);
  }

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, availability")
    .in("id", [match.user_a, match.user_b])
    .returns<ParticipantProfile[]>();
  const viewerProfile = profiles?.find((p) => p.id === user.id);
  const otherProfile = profiles?.find((p) => p.id === otherId);
  const otherName = otherProfile?.display_name ?? "your match";

  const { data: session } = await supabase
    .from("qa_sessions")
    .select("id, scheduled_at, proposed_at, proposed_by_id, confirmed_at")
    .eq("match_id", matchId)
    .maybeSingle<QaSessionRow>();

  // Closed / completed / unlocked matches — shouldn't really hit this
  // route, but show a graceful state if so.
  if (match.status !== "pending_qa" && match.status !== "qa_scheduled") {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-3 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            This match isn&apos;t open for scheduling.
          </h1>
          <p className="text-sm text-muted-foreground">
            Head back to /discover to find someone new.
          </p>
        </div>
      </main>
    );
  }

  // Confirmed and ready to call.
  if (session?.confirmed_at) {
    const when = dateFormatter.format(new Date(session.scheduled_at));
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-4 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Scheduled
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Q&amp;A with {otherName} is on.
          </h1>
          <p className="text-sm text-muted-foreground">
            {when} — London time. Open the call when it&apos;s time to start.
          </p>
          <div>
            <Link
              href={`/qa/${session.id}`}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Go to the call
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Compute three mutual-availability slots. When a proposal is already
  // on the table, exclude its time from the picker — re-clicking the
  // same slot would be a no-op for the proposer and "same time as a
  // counter" makes no sense for the recipient.
  const excludeIso = session
    ? new Date(session.scheduled_at).toISOString()
    : undefined;
  const slots =
    viewerProfile?.availability && otherProfile?.availability
      ? computeMutualSlots(
          viewerProfile.availability,
          otherProfile.availability,
          { excludeScheduledAtIso: excludeIso },
        )
      : [];

  // We've proposed, waiting on them.
  if (session && session.proposed_by_id === user.id) {
    const when = dateFormatter.format(new Date(session.scheduled_at));
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-4">
          <header className="space-y-1 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Waiting on {otherName}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              You proposed {when}.
            </h1>
            <p className="text-sm text-muted-foreground">
              We&apos;ll surface this on their /discover so they see it on
              their next visit. Or replace with a different time:
            </p>
          </header>
          <SlotPicker matchId={matchId} slots={slots} />
        </div>
      </main>
    );
  }

  // They've proposed, our turn.
  if (session && session.proposed_by_id !== user.id) {
    const when = dateFormatter.format(new Date(session.scheduled_at));
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-5">
          <header className="space-y-1 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Their proposal
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {otherName} proposed {when}.
            </h1>
            <p className="text-sm text-muted-foreground">
              London time. Confirm to lock the slot, or counter with a
              different time.
            </p>
          </header>
          <ConfirmButtons matchId={matchId} />
          <div className="space-y-2">
            <p className="text-center text-xs text-muted-foreground">
              Or counter with one of these:
            </p>
            <SlotPicker matchId={matchId} slots={slots} />
          </div>
        </div>
      </main>
    );
  }

  // No proposal yet — first move is ours.
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-4">
        <header className="space-y-1 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Schedule your Q&amp;A
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            With {otherName}.
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s when you&apos;re both free in the next week. Pick
            one — they&apos;ll get to confirm or counter.
          </p>
        </header>
        <SlotPicker matchId={matchId} slots={slots} />
      </div>
    </main>
  );
}
