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
    <div className="flex h-[100dvh] min-h-[100dvh] flex-col overflow-hidden bg-[#f8f4ec] pt-[max(1rem,calc(env(safe-area-inset-top)+1rem))] text-[#241c17] lg:block lg:h-auto lg:min-h-[100dvh] lg:overflow-x-hidden lg:pb-6 lg:pt-0">
      <header className="relative z-40 shrink-0 border-b border-[#e6ded0] bg-[#fffaf3]/95 px-4 py-3 backdrop-blur lg:sticky lg:top-0 lg:px-5">
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain lg:min-h-auto lg:overflow-visible">
        {children}
      </div>
      <AppNavigation variant="mobile" />
      <AlphaFeedbackWidget />
    </div>
  );
}
