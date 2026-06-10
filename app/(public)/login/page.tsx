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
    <main className="flex flex-1 items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md space-y-5">
        <section className="rounded-[2rem] border border-border bg-card p-8 shadow-sm">
          <header className="space-y-4 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Intentionally
            </p>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Start with intention.
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-6 text-muted-foreground">
                A calmer way to meet with clarity, safety and intention.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-medium text-muted-foreground">
              <span className="rounded-full border border-border bg-background px-2 py-2">
                Controlled reveals
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-2">
                Guided Q&amp;A
              </span>
              <span className="rounded-full border border-border bg-background px-2 py-2">
                Safer matching
              </span>
            </div>
          </header>

          <div className="mt-7">
            <LoginForm />
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
            Photos and details open gradually, after mutual interest.
          </p>
        </section>
      </div>
    </main>
  );
}
