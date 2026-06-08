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

const demoScheduleSlots = [
  {
    label: "Tonight",
    time: "7:30pm",
    helper: "Best for a quick first Q&A",
  },
  {
    label: "Tomorrow",
    time: "8:00pm",
    helper: "A calm evening slot",
  },
  {
    label: "Sunday",
    time: "6:30pm",
    helper: "Weekend reset conversation",
  },
];

function demoNameFromMatchId(matchId: string) {
  const cleaned = matchId
    .replace(/^demo-demo-/, "")
    .replace(/^demo-/, "")
    .replace(/^woman-/, "")
    .replace(/^man-/, "")
    .replace(/^nb-/, "");

  const lastPart = cleaned.split("-").filter(Boolean).pop();

  if (!lastPart) return "your match";

  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
}

function DemoSchedulePage({ matchId }: { matchId: string }) {
  const otherName = demoNameFromMatchId(matchId);

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[radial-gradient(circle_at_top,_rgba(0,0,0,0.08),_transparent_34%),linear-gradient(to_bottom,_hsl(var(--background)),_hsl(var(--muted)))] px-4 py-6">
      <div className="mx-auto w-full max-w-md space-y-5">
        <header className="space-y-2">
          <div className="inline-flex rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-sm">
            Demo Q&amp;A scheduling
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Schedule with {otherName}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            In the real app, these times come from both people’s availability.
            For demo mode, choose a sample slot to preview the next step.
          </p>
        </header>

        <section className="rounded-[2rem] border bg-background/85 p-4 shadow-sm backdrop-blur">
          <p className="text-sm font-medium">Suggested Q&amp;A times</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Your first video Q&amp;A is only 10 minutes. Chat opens later if both
            people choose to continue.
          </p>

          <div className="mt-4 space-y-2">
            {demoScheduleSlots.map((slot) => (
              <Link
                key={`${slot.label}-${slot.time}`}
                href={`/qa/${matchId}`}
                className="block rounded-3xl border bg-card p-4 transition hover:bg-muted"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">{slot.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {slot.helper}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">{slot.time}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="rounded-3xl border bg-muted/40 p-4">
          <p className="text-sm font-medium">What happens next?</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Both people answer a few guided questions on video. The aim is to
            create a better first conversation before opening chat.
          </p>
        </div>

        <Link
          href="/discover"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
        >
          Back to Discover
        </Link>
      </div>
    </main>
  );
}

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

  if (matchId.startsWith("demo-")) {
    return <DemoSchedulePage matchId={matchId} />;
  }

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
              className={cn(buttonVariants({ size: "lg" }), "w-full rounded-2xl bg-accent text-accent-foreground hover:opacity-90")}
            >
              Go to the call
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
