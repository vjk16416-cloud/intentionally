import Link from "next/link";
import { redirect } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { isUserVerified } from "@/lib/verification";

import { signOut } from "./actions";

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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
          <Link href="/discover" className="text-base font-semibold tracking-tight">
            Intentionally
          </Link>

          <div className="flex items-center gap-2">
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
    </div>
  );
}
