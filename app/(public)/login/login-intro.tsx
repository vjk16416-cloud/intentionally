"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { LoginForm } from "./login-form";

const heroImageSrc = "/images/intentionally-hero-sunset.jpg";

function SplashScreen({ onDiscover }: { onDiscover: () => void }) {
  return (
    <section className="relative min-h-svh overflow-hidden bg-[#0D1E1A] text-[#FFF8EC]">
      <Image
        src={heroImageSrc}
        alt="A couple sitting together at sunset by the water"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,236,0.08)_0%,rgba(255,248,236,0.02)_28%,rgba(13,30,26,0.48)_58%,rgba(5,13,11,0.94)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,248,236,0.22),transparent_19%),radial-gradient(circle_at_52%_76%,rgba(224,122,95,0.22),transparent_30%)]" />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-3xl flex-col items-center px-6 pb-14 pt-16 text-center sm:px-8 lg:pt-20">
        <div className="flex flex-1 flex-col items-center justify-between gap-10">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#E07A5F]/55 bg-[#FFF8EC]/10 text-2xl text-[#E07A5F] shadow-[0_16px_40px_rgba(5,13,11,0.22)] backdrop-blur">
              ♥
            </div>
            <p className="mt-6 font-serif text-4xl font-medium tracking-[-0.03em] text-[#1E3D34] drop-shadow-[0_1px_18px_rgba(255,248,236,0.58)] sm:text-5xl">
              Intentionally
            </p>
          </div>

          <div className="w-full max-w-2xl rounded-[2rem] bg-[linear-gradient(180deg,rgba(5,13,11,0.08)_0%,rgba(5,13,11,0.76)_22%,rgba(5,13,11,0.88)_100%)] px-4 pb-8 pt-14 shadow-[0_-34px_90px_rgba(5,13,11,0.32)] sm:px-8 sm:pb-10">
            <h1 className="mx-auto max-w-xl font-serif text-[2.85rem] font-medium leading-[1.08] tracking-[-0.03em] text-[#FFF8EC] sm:text-[4.2rem]">
              Meaningful connections start with intention.
            </h1>

            <div className="mx-auto mt-8 flex items-center justify-center gap-3 text-[#E07A5F]">
              <span className="h-px w-12 bg-[#FFF8EC]/45" />
              <span aria-hidden="true" className="text-xl leading-none">
                ♥
              </span>
              <span className="h-px w-12 bg-[#FFF8EC]/45" />
            </div>

            <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-[#FFF8EC]/88 sm:text-xl">
              Guided conversations. Private choices. Chat unlocks only when you both choose.
            </p>

            <button
              type="button"
              onClick={onDiscover}
              className="mt-10 inline-flex h-16 w-full max-w-[38rem] items-center justify-center gap-5 rounded-[1.7rem] bg-[#E07A5F] px-8 text-xl font-semibold tracking-wide text-[#FFF8EC] shadow-[0_18px_42px_rgba(224,122,95,0.34)] transition hover:bg-[#C96851] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:h-20 sm:text-2xl"
            >
              Discover more
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 pb-1" aria-hidden="true">
            <span className="h-2 w-16 rounded-full bg-[#E07A5F]" />
            <span className="h-2 w-16 rounded-full bg-[#FFF8EC]/28" />
            <span className="h-2 w-16 rounded-full bg-[#FFF8EC]/28" />
            <span className="hidden h-2 w-16 rounded-full bg-[#FFF8EC]/28 sm:block" />
            <span className="hidden h-2 w-16 rounded-full bg-[#FFF8EC]/28 sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
}

function LoginScreen() {
  return (
    <main className="flex min-h-svh flex-1 items-center justify-center bg-[radial-gradient(circle_at_20%_12%,rgba(224,122,95,0.12),transparent_26%),linear-gradient(135deg,#FFF8EC_0%,#F5E6D3_58%,#F6C1B3_100%)] px-5 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-md md:max-w-lg">
        <section className="rounded-[2rem] border border-[#E6D4BE] bg-[#FFF8EC]/88 p-6 shadow-[0_26px_70px_rgba(30,61,52,0.12)] backdrop-blur sm:p-8">
          <header className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E3D34] text-[#E07A5F]">
                ♥
              </div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#1E3D34]/70">
                Intentionally
              </p>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-4xl font-medium tracking-[-0.03em] text-[#1E3D34]">
                Start with intention.
              </h1>
              <p className="mx-auto max-w-sm text-sm leading-6 text-[#2B2B2B]/70 md:mx-0">
                A calmer way to meet, with a clear first step and private-by-default sign in.
              </p>
            </div>
          </header>

          <div className="mt-7">
            <LoginForm />
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/demo"
              className="inline-flex items-center justify-center text-sm font-medium text-[#1E3D34]/70 underline underline-offset-4 transition hover:text-[#1E3D34] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3D34]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFF8EC]"
            >
              Try the demo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export function LoginIntro() {
  const [showSplash, setShowSplash] = useState(true);

  return showSplash ? (
    <SplashScreen onDiscover={() => setShowSplash(false)} />
  ) : (
    <LoginScreen />
  );
}
