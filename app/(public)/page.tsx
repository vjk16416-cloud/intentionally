import Link from "next/link";
import { redirect } from "next/navigation";

import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const onboarding = await getOnboardingState(supabase, user);
    redirect(onboarding.status === "complete" ? "/discover" : onboarding.nextStep);
  }

  return (
    <main className="min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
      <section className="relative isolate min-h-svh overflow-hidden bg-[#071411]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[url('/images/splash-mobile.png')] bg-cover bg-center bg-no-repeat md:bg-[url('/images/splash-tablet.png')] lg:bg-[url('/images/splash-desktop.png')]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#071411]/5" />

        <Link
          href="/login"
          aria-label="Discover more about Intentionally"
          className="absolute left-1/2 top-[66%] h-[7%] w-[50%] -translate-x-1/2 rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F3A17F]/70 md:top-[65%] md:h-[6.5%] md:w-[34%] lg:top-[67%] lg:h-[7%] lg:w-[22%]"
        >
          <span className="sr-only">Discover more</span>
        </Link>
      </section>
    </main>
  );
}
