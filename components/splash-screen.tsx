"use client";

import {
  ArrowRight,
  CircleHelp,
  Heart,
  HeartHandshake,
  LockKeyhole,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";

type SplashScreenProps = {
  nextHref?: string;
};

export function SplashScreen({ nextHref = "/login" }: SplashScreenProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  function handleBeginWithIntention() {
    setIsLeaving(true);
    window.setTimeout(() => {
      router.push(nextHref);
    }, 420);
  }

  return (
    <section
      className={cn(
        "fixed inset-0 z-[100] isolate flex min-h-[100svh] overflow-hidden bg-[#071411] px-5 text-center text-[#FFF8EC] transition-opacity duration-500 ease-out sm:px-8",
        isLeaving && "opacity-0",
      )}
    >
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_18%_16%,rgba(243,161,127,0.28)_0%,rgba(243,161,127,0)_31%),radial-gradient(circle_at_82%_18%,rgba(83,43,62,0.62)_0%,rgba(83,43,62,0)_34%),radial-gradient(circle_at_50%_86%,rgba(168,92,74,0.28)_0%,rgba(168,92,74,0)_39%),linear-gradient(145deg,#061713_0%,#111915_38%,#241923_68%,#0A0D0C_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,rgba(255,248,236,0.07)_0%,rgba(7,20,17,0.06)_28%,rgba(7,20,17,0.68)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,13,11,0.06)_0%,rgba(5,13,11,0.20)_52%,rgba(5,13,11,0.54)_100%)]" />

      <div
        aria-hidden="true"
        className="absolute left-[-2.5rem] top-[27%] -z-10 h-52 w-36 rotate-[-13deg] rounded-[1.75rem] border border-white/14 bg-white/10 opacity-42 shadow-[0_28px_80px_rgba(5,13,11,0.28)] blur-[1px] backdrop-blur-xl min-[430px]:left-[1%] sm:left-[10%] sm:top-[24%] sm:h-64 sm:w-44 md:left-[7%] md:top-[22%] md:h-72 md:w-48 lg:left-[11%] lg:top-[26%] xl:left-[16%]"
      >
        <div className="mx-auto mt-7 h-16 w-16 rounded-full bg-[#F3A17F]/20 blur-sm" />
        <div className="mx-7 mt-8 h-3 rounded-full bg-white/24 blur-[2px]" />
        <div className="mx-10 mt-4 h-3 rounded-full bg-white/14 blur-[2px]" />
      </div>
      <div
        aria-hidden="true"
        className="absolute right-[-3rem] top-[31%] -z-10 h-56 w-40 rotate-[11deg] rounded-[1.85rem] border border-white/12 bg-[#FFF8EC]/9 opacity-34 shadow-[0_28px_80px_rgba(5,13,11,0.30)] blur-[1px] backdrop-blur-xl min-[430px]:right-[-1rem] sm:right-[9%] sm:top-[30%] sm:h-72 sm:w-48 md:right-[6%] md:top-[23%] md:h-80 md:w-52 lg:right-[11%] lg:top-[28%] xl:right-[16%]"
      >
        <div className="mx-auto mt-8 h-20 w-20 rounded-full bg-[#472936]/34 blur-md" />
        <div className="mx-8 mt-9 h-3 rounded-full bg-white/20 blur-[2px]" />
        <div className="mx-12 mt-4 h-3 rounded-full bg-[#F3A17F]/20 blur-[2px]" />
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-[6%] left-1/2 -z-10 hidden h-44 w-72 -translate-x-1/2 rounded-[2rem] border border-white/10 bg-[#0F1412]/28 opacity-35 shadow-[0_30px_90px_rgba(5,13,11,0.34)] blur-[1.5px] backdrop-blur-xl md:block lg:bottom-[10%] lg:h-48 lg:w-80"
      >
        <div className="mx-auto mt-9 h-12 w-12 rounded-full bg-white/14 blur-sm" />
        <div className="mx-16 mt-7 h-2 rounded-full bg-white/20 blur-[2px]" />
        <div className="mx-24 mt-4 h-2 rounded-full bg-[#F3A17F]/22 blur-[2px]" />
      </div>

      <div className="mx-auto flex min-h-[100svh] w-full max-w-[34rem] flex-col items-center justify-center gap-5 py-[max(0.875rem,env(safe-area-inset-top))] pb-[max(0.875rem,env(safe-area-inset-bottom))] min-[390px]:gap-6 sm:max-w-[40rem] sm:gap-8 sm:py-[max(1.5rem,env(safe-area-inset-top))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:max-w-[44rem] lg:max-w-[46rem] xl:max-w-[48rem]">
        <header className="flex shrink-0 flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center text-[#F3A17F] drop-shadow-[0_6px_18px_rgba(5,13,11,0.35)] min-[390px]:h-12 min-[390px]:w-12 sm:h-14 sm:w-14">
            <HeartHandshake aria-hidden="true" className="h-full w-full stroke-[1.5]" />
          </div>
          <p className="mt-2 font-serif text-[clamp(2.35rem,11.5vw,4.4rem)] font-medium leading-none text-[#FFF8EC] drop-shadow-[0_5px_28px_rgba(5,13,11,0.66)] min-[390px]:mt-3 sm:mt-4">
            Intentionally
          </p>
          <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[#F3A17F] min-[390px]:text-[0.66rem] min-[390px]:tracking-[0.32em] sm:text-sm sm:tracking-[0.34em]">
            Dating with purpose.
          </p>
        </header>

        <div className="w-[min(88vw,32.5rem)] rounded-[1.75rem] border border-white/[0.18] bg-[#0F1412]/45 px-5 py-6 shadow-[0_30px_90px_rgba(5,13,11,0.52)] backdrop-blur-[16px] min-[390px]:px-6 min-[390px]:py-7 sm:w-[min(86vw,36rem)] sm:rounded-[2rem] sm:px-10 sm:py-10 md:w-[min(76vw,38rem)] lg:w-[min(54vw,38rem)] xl:w-[min(48vw,39rem)]">
          <div className="mx-auto mb-4 flex items-center justify-center gap-3 text-[#F3A17F] min-[390px]:mb-5 sm:mb-7">
            <Heart aria-hidden="true" className="h-6 w-6 stroke-[1.6] sm:h-7 sm:w-7" />
            <LockKeyhole aria-hidden="true" className="h-6 w-6 stroke-[1.6] sm:h-7 sm:w-7" />
            <CircleHelp aria-hidden="true" className="h-6 w-6 stroke-[1.6] sm:h-7 sm:w-7" />
          </div>

          <h1 className="mx-auto max-w-[31rem] font-serif text-[clamp(1.75rem,7.6vw,2.35rem)] font-medium leading-[1.2] text-[#FFF8EC] sm:text-[2.65rem] sm:leading-[1.16] md:text-[2.85rem]">
            Meet slowly.
            <br />
            Choose <span className="text-[#F3A17F]">clearly</span>.
          </h1>

          <div className="mx-auto mt-5 flex max-w-[24rem] items-center justify-center gap-4 text-[#F3A17F] sm:mt-6">
            <span className="h-px flex-1 bg-white/24" />
            <Heart aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[1.7]" />
            <span className="h-px flex-1 bg-white/24" />
          </div>

          <p className="mx-auto mt-4 max-w-[30rem] text-[0.95rem] leading-7 text-[#FFF8EC]/88 min-[390px]:text-[0.98rem] sm:mt-5 sm:text-lg sm:leading-8">
            Private prompts, soft reveals and mutual choice before chat unlocks.
          </p>

          <button
            type="button"
            aria-label="Begin with intention"
            onClick={handleBeginWithIntention}
            className="mx-auto mt-6 inline-flex h-14 w-[min(88%,28rem)] items-center justify-center gap-3 rounded-2xl bg-[#F3A17F] px-5 text-base font-semibold text-[#13251F] shadow-[0_20px_46px_rgba(224,122,95,0.34)] transition duration-200 hover:bg-[#EA9270] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 min-[390px]:h-16 sm:mt-8 sm:w-[min(85%,28rem)] sm:gap-4 sm:px-8 sm:text-xl"
          >
            Begin with intention
            <ArrowRight aria-hidden="true" className="h-5 w-5 stroke-[2] sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
