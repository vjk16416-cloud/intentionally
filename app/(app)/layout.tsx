import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";

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
  const onboarding = await getOnboardingState(supabase, user.id);
  if (onboarding.status === "incomplete") {
    redirect(onboarding.nextStep);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="text-sm font-semibold tracking-tight">
          Intentionally
        </span>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </header>
      {children}
    </div>
  );
}
