import { redirect } from "next/navigation";

import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";

// Bare `/onboarding` route — sends the user to their next incomplete
// step, or to /discover if they're already done.
export default async function OnboardingIndex() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const state = await getOnboardingState(supabase, user.id);
  if (state.status === "complete") {
    redirect("/discover");
  }
  redirect(state.nextStep);
}
