import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, ShieldCheck } from "lucide-react";

import { FallbackActionLink, FallbackPanel } from "@/components/fallback-state";
import { canUseInternalTestingShortcuts } from "@/lib/internal-demo/access";
import { buttonVariants } from "@/components/ui/button";
import { computeMutualSlots } from "@/lib/scheduling/slots";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { isUserVerified } from "@/lib/verification";
import { openInternalTestVibeCheck } from "../../discover/internal-testing-actions";

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
  const showInternalDemoActions = canUseInternalTestingShortcuts(user.email);

  const { data: session } = await supabase
    .from("qa_sessions")
    .select("id, scheduled_at, proposed_at, proposed_by_id, confirmed_at")
    .eq("match_id", matchId)
    .maybeSingle<QaSessionRow>();

  const pageShell = "min-h-[calc(100vh-57px)] bg-[#f8f4ec] text-foreground";
  const outer =
    "mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10 lg:gap-6";
  const panel =
    "rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] shadow-[0_18px_60px_rgba(74,59,42,0.10)]";
  const softPanel =
    "rounded-[1.75rem] border border-[#e1e8dc] bg-[#f7faf4] shadow-[0_10px_30px_rgba(74,59,42,0.05)]";
  const trustStrip =
    "rounded-[1.4rem] border border-[#e6ded0] bg-[#fffdf8]/92 px-4 py-3 shadow-[0_4px_14px_rgba(74,59,42,0.03)]";

  if (match.status !== "pending_qa" && match.status !== "qa_scheduled") {
    return (
      <main className={pageShell}>
        <div className={outer}>
          <FallbackPanel
            eyebrow="Guided Vibe Check"
            title="This match isn&apos;t ready yet"
            description="The invite flow hasn&apos;t opened for this match."
            note="Head back to Discover and try again from there."
            action={<FallbackActionLink href="/discover">Back to Discover</FallbackActionLink>}
            className="text-center"
          />
        </div>
      </main>
    );
  }

  if (session?.confirmed_at) {
    const when = dateFormatter.format(new Date(session.scheduled_at));
    return (
      <main className={pageShell}>
        <div className={outer}>
          <section className={`${panel} px-5 py-7 sm:px-6 sm:py-8`}>
            <div className="flex flex-col gap-5 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Scheduled
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Guided Vibe Check with {otherName} is on.
              </h1>
              <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
                {when}. London time. Open the call when it&apos;s time to
                start.
              </p>
              <div className="mx-auto grid w-full max-w-sm gap-3">
                <Link
                  href={`/qa/${session.id}`}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full rounded-2xl bg-[#75886b] text-white shadow-[0_12px_30px_rgba(83,104,73,0.24)] hover:bg-[#697b60]",
                  )}
                >
                  Join Vibe Check
                </Link>
                {showInternalDemoActions ? (
                  <form action={openInternalTestVibeCheck}>
                    <button
                      type="submit"
                      className="w-full rounded-2xl border border-[#d8d0c3] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-foreground shadow-[0_6px_16px_rgba(74,59,42,0.03)] transition hover:bg-[#faf6ee]"
                    >
                      Start demo Vibe Check
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </section>

          <section className={`${softPanel} px-5 py-5 sm:px-6`}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              What happens next?
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You&apos;ll join the guided call at the scheduled time. After you
              both choose Continue, chat opens.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const trustItems = [
    {
      label: "Safe & verified",
      icon: ShieldCheck,
    },
    {
      label: "15–30 min guided call",
      icon: Clock3,
    },
    {
      label: "Private & secure",
      icon: CalendarDays,
    },
  ];

  const scheduleHero = (
    <section className={`${panel} px-5 py-6 sm:px-6 sm:py-7`}>
      <div className="max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ded0] bg-[#fffdf8] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-[#75886b]" />
          Guided Vibe Check
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            Schedule your Guided Vibe Check
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-[2.5rem]">
            With {otherName}.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            You both chose to connect. Pick a time for a short guided video
            call. They can accept or suggest another time.
          </p>
        </div>
      </div>

      <div className={`${trustStrip} mt-5 max-w-2xl`}>
        <ul className="grid gap-2 text-sm font-medium leading-5 text-[#5f5a50] sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[#e6ded0]">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <li
                key={item.label}
                className={cn(
                  "flex items-center gap-2 py-0.5 sm:px-4 sm:py-0 sm:justify-center",
                  index > 0 ? "sm:pl-4" : "",
                )}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d8d0c3] bg-[#f8f4ec]">
                  <Icon className="h-3 w-3 text-[#75886b]" />
                </span>
                <span className="whitespace-normal text-left sm:text-center">
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 max-w-2xl rounded-[1.4rem] border border-[#e6ded0] bg-[#fffdf8]/92 px-4 py-3 shadow-[0_4px_14px_rgba(74,59,42,0.03)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[#6f6258]">
            Want to see the flow first? Preview a sandbox invite with mock
            details only.
          </p>
          <Link
            href="/demo#demo-invite"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl border border-[#d8d0c3] bg-[#fffdf8] px-4 text-sm font-semibold text-[#3d342d] shadow-[0_6px_16px_rgba(74,59,42,0.03)] transition hover:bg-[#faf6ee] focus-visible:ring-3 focus-visible:ring-[#7d916f]/30"
          >
            Preview demo invite
          </Link>
        </div>
      </div>
    </section>
  );

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
      <main className={pageShell}>
        <div className={outer}>
          {scheduleHero}
          <section className={`${softPanel} px-5 py-5 sm:px-6`}>
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e3cf] bg-[#eef2e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5d6c55]">
                Invite sent
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Waiting on {otherName}
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                You proposed {when}.
              </h2>
              <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
                Invite sent. They can accept or suggest another time. When
                accepted, your Vibe Check will unlock here.
              </p>
            </div>
            <div className="mt-5">
              <SlotPicker matchId={matchId} slots={slots} />
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {showInternalDemoActions ? (
                <form action={openInternalTestVibeCheck}>
                  <button
                    type="submit"
                    className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-[#75886b] px-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(83,104,73,0.20)] transition hover:bg-[#697b60] sm:w-auto"
                  >
                    Start demo Vibe Check
                  </button>
                </form>
              ) : null}
              <Link
                href="/discover"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#d8d0c3] bg-[#fffdf8] px-4 text-sm font-semibold text-foreground shadow-[0_6px_16px_rgba(74,59,42,0.03)] transition hover:bg-[#faf6ee]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Discover
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (session && session.proposed_by_id !== user.id) {
    const when = dateFormatter.format(new Date(session.scheduled_at));
    return (
      <main className={pageShell}>
        <div className={outer}>
          {scheduleHero}
          <section className={`${softPanel} px-5 py-5 sm:px-6`}>
            <div className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Invite received
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {otherName} invited you to a Vibe Check.
              </h2>
              <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground">
                Proposed time: {when}. London time. Accept this slot, or
                suggest another time.
              </p>
            </div>
            <div className="mt-5">
              <ConfirmButtons matchId={matchId} />
            </div>
            <div className="mt-5 space-y-3">
              <p className="text-center text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Suggest another time
              </p>
              <SlotPicker matchId={matchId} slots={slots} />
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
      <main className={pageShell}>
        <div className={outer}>
          {scheduleHero}
          <section className={`${softPanel} px-5 py-5 sm:px-6`}>
            <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Pick a time
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                Choose the slot that feels easiest.
              </h2>
            </div>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Three options shown soonest first.
            </p>
          </div>
          <SlotPicker matchId={matchId} slots={slots} />
        </section>

        <section className={`${softPanel} px-5 py-5 sm:px-6`}>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
            What happens next?
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            They&apos;ll get your request and can accept or suggest a different
            time. You&apos;ll get a confirmation once it&apos;s booked.
          </p>
        </section>
      </div>
    </main>
  );
}
