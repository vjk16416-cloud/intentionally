import Link from "next/link";
import { redirect } from "next/navigation";

import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";

const proofPoints = [
  { icon: "◌", label: "Private pace" },
  { icon: "?", label: "Guided Q&A" },
  { icon: "✓", label: "Mutual unlock" },
  { icon: "♡", label: "Real intention" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const onboarding = await getOnboardingState(supabase, user);
    redirect(onboarding.status === "complete" ? "/discover" : onboarding.nextStep);
  }

  return (
    <main className="min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
      <section className="relative isolate flex min-h-svh overflow-hidden bg-[#071411] px-4 py-[max(1rem,env(safe-area-inset-top))] text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-40 bg-[#071411]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-30 bg-[url('/images/intentionally-arms-hero.png')] bg-cover bg-[position:center_bottom] bg-no-repeat sm:bg-[position:center_58%] lg:bg-[position:center_center]"
        />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(5,13,11,0.62)_0%,rgba(5,13,11,0.22)_34%,rgba(5,13,11,0.18)_56%,rgba(5,13,11,0.66)_100%),radial-gradient(circle_at_50%_48%,rgba(243,161,127,0.20)_0%,transparent_36%),radial-gradient(circle_at_center,transparent_0%,transparent_58%,rgba(0,0,0,0.44)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-[8%] bottom-[20%] -z-10 h-px rotate-[-7deg] bg-gradient-to-r from-transparent via-[#F3A17F]/42 to-transparent sm:bottom-[25%] lg:bottom-[23%]" />
        <div aria-hidden="true" className="absolute left-1/2 top-[56%] -z-10 h-[19rem] w-[19rem] -translate-x-1/2 rounded-full border border-[#F3A17F]/12 shadow-[0_0_74px_rgba(243,161,127,0.16)] sm:h-[26rem] sm:w-[26rem] lg:top-[57%] lg:h-[32rem] lg:w-[32rem]" />

        <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[38rem] flex-col items-center justify-start gap-4 py-3 sm:max-w-[43rem] md:max-w-[48rem] lg:max-w-[58rem]">
          <header className="mt-[clamp(1.5rem,7svh,5rem)] flex shrink-0 flex-col items-center sm:mt-[clamp(2rem,8svh,5.5rem)]">
            <div className="text-[2.45rem] leading-none text-[#F3A17F] drop-shadow-[0_0_24px_rgba(243,161,127,0.34)] sm:text-[2.9rem] lg:text-[3.2rem]">
              ♡
            </div>
            <p className="mt-2 font-serif text-[clamp(2.55rem,12vw,4.45rem)] font-medium leading-none tracking-[-0.05em] text-[#FFF8EC] drop-shadow-[0_6px_30px_rgba(5,13,11,0.82)] sm:mt-3">
              Intentionally
            </p>
            <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.36em] text-[#F3A17F] drop-shadow-[0_4px_18px_rgba(5,13,11,0.72)] sm:mt-3 sm:text-sm sm:tracking-[0.38em]">
              Dating with purpose.
            </p>
          </header>

          <section className="mt-[clamp(1.35rem,5svh,3rem)] w-full max-w-[40rem] px-1 sm:max-w-[44rem] lg:mt-[clamp(1rem,4svh,2.5rem)]">
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#FFF8EC]/18 bg-[#050D0B]/58 px-5 py-6 shadow-[0_34px_120px_rgba(0,0,0,0.54),0_0_0_1px_rgba(243,161,127,0.10),inset_0_1px_0_rgba(255,248,236,0.16),inset_0_-32px_80px_rgba(0,0,0,0.22)] backdrop-blur-[22px] sm:rounded-[2.25rem] sm:px-9 sm:py-8 lg:px-12 lg:py-10">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_50%_0%,rgba(255,248,236,0.12),transparent_34%),linear-gradient(180deg,rgba(255,248,236,0.04),rgba(0,0,0,0.10))]" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#FFF8EC]/28 to-transparent" />
              <div className="relative">
                <div className="mx-auto mb-3 flex h-9 w-16 items-center justify-center text-[2rem] leading-none text-[#F3A17F] sm:mb-4 sm:h-11 sm:w-20 sm:text-[2.55rem]">
                  ♡♡
                </div>

                <h1 className="mx-auto max-w-[34rem] font-serif text-[clamp(1.78rem,7.6vw,2.55rem)] font-medium leading-[1.12] tracking-[-0.04em] text-[#FFF8EC] drop-shadow-[0_6px_24px_rgba(5,13,11,0.76)] sm:text-[2.8rem] lg:text-[3rem]">
                  Meaningful connections
                  <br />
                  start with <span className="text-[#F3A17F]">intention</span>.
                </h1>

                <div className="mx-auto mt-4 flex max-w-[23rem] items-center justify-center gap-4 text-[#F3A17F] sm:mt-5">
                  <span className="h-px flex-1 bg-[#FFF8EC]/28" />
                  <span aria-hidden="true" className="text-base leading-none sm:text-lg">
                    ♡
                  </span>
                  <span className="h-px flex-1 bg-[#FFF8EC]/28" />
                </div>

                <p className="mx-auto mt-4 max-w-[31rem] text-[0.92rem] leading-6 text-[#FFF8EC]/90 drop-shadow-[0_4px_18px_rgba(5,13,11,0.72)] sm:text-lg sm:leading-8">
                  Guided conversations. Private choices.
                  <br className="hidden sm:block" />
                  Chat unlocks only when you both choose.
                </p>

                <Link
                  href="/login"
                  aria-label="Discover more about Intentionally"
                  className="mx-auto mt-5 inline-flex h-14 w-full max-w-[25rem] items-center justify-center gap-4 rounded-[1.1rem] bg-[#F3A17F] px-7 text-base font-semibold text-[#13251F] shadow-[0_22px_48px_rgba(243,161,127,0.28)] transition duration-200 hover:bg-[#EA9270] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:mt-7 sm:h-16 sm:gap-5 sm:rounded-2xl sm:text-xl"
                >
                  Discover more
                  <span aria-hidden="true" className="text-xl leading-none sm:text-2xl">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </section>

          <div className="mt-auto hidden w-full max-w-[41rem] grid-cols-4 gap-3 pb-4 text-left text-xs text-[#FFF8EC]/82 md:grid">
            {proofPoints.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#FFF8EC]/10 bg-[#071411]/28 px-4 py-3 backdrop-blur-sm">
                <span className="block text-sm text-[#F3A17F]">{item.icon}</span>
                <span className="mt-1 block font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
