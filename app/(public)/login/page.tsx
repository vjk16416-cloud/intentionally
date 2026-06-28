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
    <main className="relative isolate flex flex-1 items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-6 sm:py-16">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(243,161,127,0.18)_0%,transparent_28%),radial-gradient(circle_at_88%_4%,rgba(16,35,29,0.14)_0%,transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-[#071411]/8 to-transparent" />

      <div className="w-full max-w-md md:max-w-lg">
        <section className="rounded-[2rem] border border-border bg-card/95 p-6 shadow-[0_24px_70px_rgba(74,59,42,0.10)] backdrop-blur-sm sm:p-8">
          <header className="space-y-4 text-center md:text-left">
            <div className="flex flex-col items-center gap-2 md:items-start">
              <div className="text-3xl leading-none text-[#F3A17F]">♡</div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#9B6F5E]">
                Intentionally
              </p>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                Start with intention.
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground md:mx-0">
                A calmer way to meet, with a clear first step and private-by-default
                sign in.
              </p>
            </div>
          </header>

          <div className="mt-7">
            <LoginForm />
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center text-sm font-medium text-muted-foreground underline underline-offset-4 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Try the demo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
