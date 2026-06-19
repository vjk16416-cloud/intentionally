import Link from "next/link";
import { CalendarDays, MessageCircle, ShieldCheck, Video } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const demoSteps = [
  {
    title: "Discover with context",
    body: "See prompts, intention, and readiness before deciding whether to connect.",
  },
  {
    title: "Send a guided invite",
    body: "A Vibe Check invite is a calm next step, not an instant chat request.",
  },
  {
    title: "Meet in a short session",
    body: "The demo shows the guided Q&A flow with mock people and no account data.",
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-[#f8f4ec] px-4 py-6 text-[#241c17] sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <nav className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-[#3d342d]"
          >
            Intentionally
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-semibold text-[#6f6258] transition hover:bg-[#f3eee5] hover:text-[#3d342d] focus-visible:ring-3 focus-visible:ring-[#7d916f]/30"
          >
            Sign in
          </Link>
        </nav>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.75fr)] lg:items-stretch">
          <div className="rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-5 shadow-[0_18px_60px_rgba(74,59,42,0.10)] sm:p-7 lg:p-8">
            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d8ccbd] bg-[#fffdf8] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#6f6258]">
                <ShieldCheck className="h-4 w-4 text-[#75886b]" />
                Public demo
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Explore the Vibe Check journey.
                </h1>
                <p className="max-w-xl text-base leading-7 text-[#6f6258]">
                  Try a safe preview of Intentionally using mock profiles,
                  demo invite copy, and a guided session walkthrough. No login,
                  no real matches, and no private user data.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                <a
                  href="#demo-invite"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 rounded-2xl bg-[#75886b] px-5 text-base font-semibold text-white shadow-[0_12px_30px_rgba(83,104,73,0.22)] hover:bg-[#697b60]",
                  )}
                >
                  Preview demo invite
                </a>
                <p className="text-sm leading-6 text-[#6f6258]">
                  This is a sandbox preview. It will not send or accept a real
                  invite.
                </p>
              </div>
            </div>
          </div>

          <aside className="overflow-hidden rounded-[2rem] border border-[#e6ded0] bg-[#2f2a23] shadow-[0_18px_60px_rgba(74,59,42,0.14)]">
            <div className="relative min-h-[460px] p-5 text-white sm:min-h-[520px]">
              <div className="absolute inset-0 bg-[linear-gradient(160deg,#635443_0%,#2f2a23_56%,#75886b_120%)]" />
              <div className="relative flex h-full min-h-[420px] flex-col justify-between">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-semibold">
                    Demo profile
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/12 px-3 py-1.5 text-xs font-semibold">
                    Vibe Check ready
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-white/20 bg-[#fff8ef] text-4xl font-semibold text-[#6f6258] shadow-[0_18px_45px_rgba(0,0,0,0.18)]">
                    M
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight">
                      Maya, 31
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-white/74">
                      London. Looking for a thoughtful first conversation.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/18 bg-black/24 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/62">
                      Prompt preview
                    </p>
                    <p className="mt-2 text-base font-semibold leading-6">
                      &ldquo;A good first date leaves room to be
                      curious.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section
          id="demo-invite"
          className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]"
        >
          <div className="rounded-[2rem] border border-[#e1e8dc] bg-[#f7faf4] p-5 shadow-[0_10px_30px_rgba(74,59,42,0.05)] sm:p-6">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cbd8c3] bg-[#eef5e8]">
              <CalendarDays className="h-5 w-5 text-[#536849]" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#6f6258]">
              Demo invite
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#3d342d]">
              Maya invited you to a Vibe Check.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#6f6258]">
              Proposed time: tomorrow at 7:30 PM. In the real app, you can
              accept, suggest another time, or pause without pressure.
            </p>
            <Link
              href="#demo-session"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "mt-5 h-12 w-full rounded-2xl border-[#d8ccbd] bg-[#fffdf8] text-[#3d342d] hover:bg-[#f3eee5]",
              )}
            >
              Try demo session
            </Link>
          </div>

          <div
            id="demo-session"
            className="rounded-[2rem] border border-[#e6ded0] bg-[#fffaf3] p-5 shadow-[0_10px_30px_rgba(74,59,42,0.06)] sm:p-6"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8ccbd] bg-[#fffdf8]">
                <Video className="h-5 w-5 text-[#75886b]" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6f6258]">
                  Guided session
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#3d342d]">
                  A short preview of what unlocks before chat.
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {demoSteps.map((step, index) => (
                <article
                  key={step.title}
                  className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-[1.35rem] border border-[#eadfce] bg-[#fffdf8] p-4"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef5e8] text-sm font-semibold text-[#536849]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#3d342d]">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[#6f6258]">
                      {step.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-[#e1e8dc] bg-[#f7faf4] p-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#75886b]" />
                <p className="text-sm leading-6 text-[#5f5a50]">
                  Chat only opens after both people choose to continue. This
                  demo page does not create a match, call, chat, or account.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
