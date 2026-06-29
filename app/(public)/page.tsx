import { redirect } from "next/navigation";

import { SplashScreen } from "@/components/splash-screen";
import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  if (typeof params.code === "string" && params.code) {
    const callbackParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") {
        callbackParams.set(key, value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          callbackParams.append(key, item);
        }
      }
    }

    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const onboarding = await getOnboardingState(supabase, user);
    redirect(onboarding.status === "complete" ? "/discover" : onboarding.nextStep);
  }

  return <SplashScreen nextHref="/login" />;
}
