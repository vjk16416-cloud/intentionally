import Link from "next/link";
import { redirect } from "next/navigation";

import { AlphaFeedbackWidget } from "@/components/feedback/alpha-feedback-widget";
import { Button, buttonVariants } from "@/components/ui/button";
import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { isUserVerified } from "@/lib/verification";

import { signOut } from "./actions";
import { AppNavigation } from "./app-navigation";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Gate on profile completeness.
  // Local demo bypass: do not let the conditional phone step block /discover.
  // Phone capture is needed later for contact reveal, but it should not stop
  // us previewing the demo flow during development.
  const onboarding = await getOnboardingState(supabase, user);
  if (
    onboarding.status === "incomplete" &&
    onboarding.nextStep !== "/onboarding/phone"
  ) {
    redirect(onboarding.nextStep);
  }

  // Don't gate the layout on id_verified — the locked decision in §6.1
  // is to gate only at Q&A scheduling. Surface a header link for
  // unverified users so /verify is discoverable now (for testing) and
  // a sensible pre-flight before the gate fires later.
  const verified = await isUserVerified(supabase, user.id);

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#f8f4ec] pb-[calc(80px+env(safe-area-inset-bottom))] pt-[max(1rem,calc(env(safe-area-inset-top)+1rem))] text-[#241c17] lg:pb-6 lg:pt-0">
      <header className="relative z-40 mx-3 overflow-visible rounded-[1.75rem] border border-[#e6ded0] bg-[#fffaf3]/95 px-3 py-3 shadow-[0_8px_30px_rgba(74,59,42,0.06)] backdrop-blur lg:sticky lg:top-0 lg:mx-0 lg:rounded-none lg:border-x-0 lg:border-t-0 lg:px-5">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 lg:grid lg:max-w-6xl lg:grid-cols-[1fr_auto_1fr] lg:items-center xl:max-w-7xl">
          <div className="flex min-w-0 items-center justify-between gap-3 md:justify-start">
            <Link
              href="/discover"
              className="min-w-0 text-base font-semibold tracking-tight text-foreground"
            >
              Intentionally
            </Link>

            <div className="flex shrink-0 items-center gap-2 md:hidden">
              {!verified ? (
                <Link
                  href="/verify"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "rounded-full border-border bg-card px-4 text-xs font-medium",
                  )}
                >
                  Verify
                </Link>
              ) : null}

              <form action={signOut}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="rounded-full px-3 text-xs text-neutral-500"
                >
                  Sign out
                </Button>
              </form>
            </div>
          </div>

          <div className="hidden lg:flex lg:justify-center">
            <AppNavigation variant="desktop" />
          </div>

          <div className="hidden shrink-0 items-center gap-2 lg:flex lg:justify-end">
            {!verified ? (
              <Link
                href="/verify"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-full border-border bg-card px-4 text-xs font-medium",
                )}
              >
                Verify
              </Link>
            ) : null}

            <form action={signOut}>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="rounded-full px-3 text-xs text-neutral-500"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      {children}
      <AppNavigation variant="mobile" />
      <AlphaFeedbackWidget />
    </div>
  );
}
