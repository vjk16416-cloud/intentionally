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
    <main className="flex flex-1 items-center justify-center bg-background px-5 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-md md:max-w-lg">
        <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
          <header className="space-y-4 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Intentionally
            </p>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
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
