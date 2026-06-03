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

  // Gate on profile completeness (NOT on id_verified — that's a Step 5
  // pre-Q&A gate, not an onboarding requirement).
  const onboarding = await getOnboardingState(supabase, user);
  if (onboarding.status === "incomplete") {
    redirect(onboarding.nextStep);
  }

  // Don't gate the layout on id_verified — the locked decision in §6.1
  // is to gate only at Q&A scheduling. Surface a header link for
  // unverified users so /verify is discoverable now (for testing) and
  // a sensible pre-flight before the gate fires later.
  const verified = await isUserVerified(supabase, user.id);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="text-sm font-semibold tracking-tight">
          Intentionally
        </span>
        <div className="flex items-center gap-2">
          {!verified ? (
            <Link
              href="/verify"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Verify ID
            </Link>
          ) : null}
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
