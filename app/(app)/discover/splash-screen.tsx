"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";

const splashImageSrc = "/images/intentionally-hero-sunset.jpg";

type SplashScreenProps = {
  children: ReactNode;
};

export function SplashScreen({ children }: SplashScreenProps) {
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  if (hasSeenSplash) {
    return (
      <div className="animate-in fade-in duration-500 motion-reduce:animate-none">
        {children}
      </div>
    );
  }

  return (
    <section className="relative isolate flex min-h-[100svh] overflow-hidden bg-[#071411] px-5 py-[max(1.5rem,env(safe-area-inset-top))] text-center text-[#FFF8EC] sm:px-8">
      <Image
        src={splashImageSrc}
        alt="Two people holding hands outdoors in a calm natural landscape"
        fill
        priority
        sizes="100vw"
        className="-z-30 object-cover object-center"
      />

      <div className="absolute inset-0 -z-20 bg-[#071411]/52" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,13,11,0.18)_0%,rgba(5,13,11,0.28)_34%,rgba(5,13,11,0.56)_100%)]" />

      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[34rem] flex-col items-center justify-center gap-6 py-4 sm:max-w-[38rem] sm:gap-8 md:max-w-[42rem]">
        <header className="flex shrink-0 flex-col items-center">
          <div className="text-5xl leading-none text-[#F3A17F] drop-shadow-[0_6px_18px_rgba(5,13,11,0.35)] sm:text-6xl">
            ♡
          </div>
          <p className="mt-4 font-serif text-[clamp(2.75rem,13vw,4.4rem)] font-medium leading-none tracking-[-0.045em] text-[#FFF8EC] drop-shadow-[0_5px_28px_rgba(5,13,11,0.66)]">
            Intentionally
          </p>
          <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-[#F3A17F] sm:text-sm">
            Dating with purpose.
          </p>
        </header>

        <div className="w-full rounded-[1.9rem] border border-white/22 bg-[#0F1412]/45 px-6 py-8 shadow-[0_30px_90px_rgba(5,13,11,0.48)] backdrop-blur-[14px] sm:rounded-[2rem] sm:px-10 sm:py-10">
          <div className="mx-auto mb-5 flex h-12 w-20 items-center justify-center text-4xl leading-none text-[#F3A17F] sm:mb-7 sm:text-5xl">
            ♡♡
          </div>

          <h1 className="mx-auto max-w-[31rem] font-serif text-[clamp(1.9rem,8.5vw,2.45rem)] font-medium leading-[1.16] tracking-[-0.035em] text-[#FFF8EC] sm:text-[2.7rem]">
            Meaningful connections
            <br />
            start with <span className="text-[#F3A17F]">intention</span>.
          </h1>

          <div className="mx-auto mt-6 flex max-w-[24rem] items-center justify-center gap-4 text-[#F3A17F]">
            <span className="h-px flex-1 bg-white/24" />
            <span aria-hidden="true" className="text-lg leading-none">
              ♡
            </span>
            <span className="h-px flex-1 bg-white/24" />
          </div>

          <p className="mx-auto mt-5 max-w-[30rem] text-[0.98rem] leading-7 text-[#FFF8EC]/88 sm:text-lg sm:leading-8">
            Guided conversations. Private choices.
            <br className="hidden sm:block" />
            Chat unlocks only when you both choose.
          </p>

          <button
            type="button"
            aria-label="Discover more about Intentionally"
            onClick={() => setHasSeenSplash(true)}
            className="mx-auto mt-8 inline-flex h-16 w-[min(100%,28rem)] items-center justify-center gap-5 rounded-2xl bg-[#F3A17F] px-8 text-base font-semibold text-[#13251F] shadow-[0_20px_46px_rgba(224,122,95,0.34)] transition duration-200 hover:bg-[#EA9270] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:text-xl"
          >
            Discover more
            <span aria-hidden="true" className="text-2xl leading-none">
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
