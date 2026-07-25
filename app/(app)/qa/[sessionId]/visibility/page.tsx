import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarCheck,
  CircleCheck,
  Headphones,
  LockKeyhole,
  MessageCircle,
  Mic,
  ShieldCheck,
  Video,
  Wifi,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { QA_VISIBILITY_OPTIONS } from "@/lib/qa/visibility";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { startQaSession } from "../actions";

type ParticipantProfile = {
  id: string;
  display_name: string | null;
};

export default async function QaVisibilityPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const softReveal = QA_VISIBILITY_OPTIONS.dynamic;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: session } = await supabase
    .from("qa_sessions")
    .select("id, match_id, status, confirmed_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (!session) {
    redirect("/discover");
  }

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("id", session.match_id)
    .maybeSingle();

  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    redirect("/discover");
  }

  if (!session.confirmed_at) {
    redirect(`/schedule/${session.match_id}`);
  }
  if (session.status !== "scheduled" && session.status !== "in_progress") {
    redirect(`/qa/${sessionId}`);
  }

  const otherId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", [match.user_a, match.user_b])
    .returns<ParticipantProfile[]>();
  const otherProfile = profiles?.find((profile) => profile.id === otherId);
  const otherName = otherProfile?.display_name ?? "your match";
  const otherInitial = otherName.trim().slice(0, 1).toUpperCase() || "I";

  return (
    <main className="min-h-[calc(100vh-57px)] bg-[linear-gradient(180deg,#f8f4ec_0%,#f1e8da_100%)] px-4 py-6 pb-28 text-foreground sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-105px)] w-full max-w-6xl content-center gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
        <div className="order-2 space-y-3 md:order-1 md:space-y-5 lg:space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Prepare to join
            </p>
            <h1 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[3.25rem]">
              A few quiet checks before you begin.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Settle in, then join {otherName} when you feel ready. There is no
              need to get everything perfect.
            </p>
          </div>

          <div className="max-w-xl space-y-4 pt-1 sm:pt-3 lg:space-y-5">
            <div className="flex gap-3">
              <CircleCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-[#697b60]"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Find a comfortable spot
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  A little privacy and a moment to settle can make the
                  conversation feel easier.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Headphones
                className="mt-0.5 h-4 w-4 shrink-0 text-[#697b60]"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Use headphones if you&apos;d like
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  They can give you a little more privacy and help you focus.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <MessageCircle
                className="mt-0.5 h-4 w-4 shrink-0 text-[#697b60]"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Keep it simple
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  You can take your time and skip any prompt that does not feel
                  right.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="order-1 rounded-[2rem] border border-border/60 bg-card p-4 shadow-[0_18px_60px_rgba(74,59,42,0.10)] sm:p-6 md:order-2 md:p-7 lg:p-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#cfdbca] bg-secondary text-base font-semibold text-[#536849] sm:h-16 sm:w-16 sm:text-lg"
              aria-hidden="true"
            >
              {otherInitial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                You&apos;re meeting
              </p>
              <h2 className="mt-0.5 truncate text-2xl font-semibold tracking-tight text-foreground">
                {otherName}
              </h2>
            </div>
          </div>

          <div className="mt-6 border-t border-border/60 pt-6 sm:mt-8 sm:pt-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Before you join
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We&apos;ll ask for camera and microphone access when you enter. {softReveal.label} is ready for a gentler start.
            </p>
          </div>

          <div className="mt-[1.625rem] divide-y divide-border/60 border-y border-border/60">
            <div className="flex gap-3 py-4">
              <Video
                className="mt-0.5 h-4 w-4 shrink-0 text-[#697b60]"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">Camera</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  You&apos;ll be asked to allow access when you join.
                </p>
              </div>
            </div>
            <div className="flex gap-3 py-4">
              <Mic
                className="mt-0.5 h-4 w-4 shrink-0 text-[#697b60]"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Microphone
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  A quick audio check helps you both feel heard.
                </p>
              </div>
            </div>
            <div className="flex gap-3 py-4">
              <Wifi
                className="mt-0.5 h-4 w-4 shrink-0 text-[#697b60]"
                strokeWidth={1.75}
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Connection
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  A steady connection helps the conversation stay present.
                </p>
              </div>
            </div>
          </div>

          <form action={startQaSession} className="mt-[1.625rem]">
            <input type="hidden" name="sessionId" value={sessionId} />
            <button
              type="submit"
              className={cn(
                buttonVariants({ size: "lg" }),
                "w-full rounded-2xl bg-[#75886b] text-white shadow-[0_8px_18px_rgba(83,104,73,0.14)] hover:bg-[#697b60]",
              )}
            >
              <Video className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Join Vibe Check
            </button>
          </form>

          <Link
            href={`/qa/${sessionId}`}
            className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:mt-8"
          >
            <CalendarCheck className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Leave
          </Link>

          <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <LockKeyhole
              className="h-4 w-4 text-[#697b60]"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            Your conversation and choice stay private.
          </p>

          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[0.7rem] leading-5 text-muted-foreground/75">
            <ShieldCheck
              className="h-4 w-4 shrink-0 text-[#697b60]/75"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            You can leave or skip a prompt at any time.
          </p>
        </section>
      </div>
    </main>
  );
}
