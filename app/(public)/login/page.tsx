import Link from "next/link";
import { redirect } from "next/navigation";

import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const onboarding = await getOnboardingState(supabase, user);
    redirect(
      onboarding.status === "complete" ? "/discover" : onboarding.nextStep,
    );
  }

  return (
    <main className="relative isolate flex min-h-svh overflow-hidden bg-[#F8F1E8] px-4 py-[max(1rem,env(safe-area-inset-top))] text-[#10231D] sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-30 bg-[#F8F1E8]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(7,20,17,0.28)_0%,rgba(16,35,29,0.16)_24%,transparent_46%),radial-gradient(circle_at_18%_18%,rgba(243,161,127,0.22)_0%,transparent_30%),radial-gradient(circle_at_86%_12%,rgba(243,161,127,0.18)_0%,transparent_32%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-[42svh] bg-gradient-to-b from-[#071411]/18 via-[#10231D]/8 to-transparent" />
      <div aria-hidden="true" className="absolute left-[9%] top-[21%] -z-10 h-px w-[82vw] max-w-[48rem] -rotate-[18deg] bg-gradient-to-r from-transparent via-[#F3A17F]/24 to-transparent" />

      <section className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[30rem] flex-col justify-center py-2 sm:max-w-[31rem]">
        <nav className="mb-6 flex items-center justify-between text-sm text-[#10231D]/72 sm:mb-8">
          <Link
            href="/"
            aria-label="Back to Intentionally splash page"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#10231D]/10 bg-white/46 text-lg shadow-sm backdrop-blur-sm transition hover:bg-white/70"
          >
            ←
          </Link>
          <Link
            href="/demo"
            className="rounded-full border border-[#10231D]/10 bg-white/46 px-4 py-2 font-medium shadow-sm backdrop-blur-sm transition hover:bg-white/70"
          >
            Help
          </Link>
        </nav>

        <div className="rounded-[2.25rem] border border-white/70 bg-white/48 px-5 py-7 shadow-[0_28px_90px_rgba(74,59,42,0.16)] backdrop-blur-2xl sm:px-7 sm:py-8">
          <header className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#F3A17F]/30 bg-[#FFF8EC]/80 text-3xl leading-none text-[#F3A17F] shadow-[0_14px_36px_rgba(243,161,127,0.18)]">
              ♡
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.32em] text-[#9B6F5E]">
              Intentionally
            </p>
            <h1 className="mx-auto mt-4 max-w-[17rem] font-serif text-[2.35rem] font-medium leading-[1.02] tracking-[-0.045em] text-[#10231D] sm:text-[2.75rem]">
              Start with intention.
            </h1>
            <p className="mx-auto mt-4 max-w-[17rem] text-sm leading-6 text-[#10231D]/68">
              Private by design. Built for real connections.
            </p>
          </header>

          <div className="mt-7">
            <LoginForm />
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/demo"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#F3A17F]/45 px-5 text-sm font-semibold text-[#C06F55] transition hover:bg-[#F3A17F]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F3A17F]/20"
            >
              Continue as guest
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
