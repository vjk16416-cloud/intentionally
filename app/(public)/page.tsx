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
      <section className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[#071411] p-0">
        <div aria-hidden="true" className="absolute inset-0 -z-30 bg-[#071411]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[url('/images/intentionally-splash-exact.png')] bg-contain bg-center bg-no-repeat"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_62%,rgba(7,20,17,0.72)_100%)]" />

        <Link
          href="/login"
          aria-label="Discover more about Intentionally"
          className="absolute left-1/2 top-[64%] h-[7%] w-[42%] max-w-[28rem] -translate-x-1/2 rounded-[1.25rem] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F3A17F]/70 sm:top-[65%] sm:h-[7%] sm:w-[33%] lg:top-[65%] lg:w-[25%]"
        >
          <span className="sr-only">Discover more</span>
        </Link>
      </section>
    </main>
  );
}
