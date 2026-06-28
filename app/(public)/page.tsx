"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const heroImageSrc = "/images/intentionally-hero-sunset.jpg";

function BrandMark({ centred = false }: { centred?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 ${centred ? "justify-center" : ""}`}
      aria-label="Intentionally"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1E3D34] shadow-[0_14px_32px_rgba(30,61,52,0.18)]">
        <span className="text-lg leading-none text-[#E07A5F]">♥</span>
      </div>
      <span className="text-base font-semibold tracking-wide text-[#1E3D34]">
        Intentionally
      </span>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-[#F4B660]"
      fill="none"
    >
      <path
        d="M12 3.25 18.5 6v5.3c0 4.25-2.62 7.72-6.5 9.45-3.88-1.73-6.5-5.2-6.5-9.45V6L12 3.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeroPhoto() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-[#E07A5F]/20 bg-[#F5E6D3] shadow-[0_30px_80px_rgba(30,61,52,0.14)]">
      <div className="relative aspect-[4/5] w-full md:aspect-[1.02/1] lg:aspect-[1.08/1]">
        <Image
          src={heroImageSrc}
          alt="A couple sitting together at sunset by the water"
          fill
          priority
          sizes="(max-width: 767px) 86vw, (max-width: 1023px) 44vw, 46vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,236,0.02)_0%,rgba(30,61,52,0.02)_54%,rgba(30,61,52,0.52)_100%)]" />
        <div className="absolute inset-x-[11%] bottom-[20%] h-px bg-[#FFF8EC]/26" />
      </div>
    </div>
  );
}

function TrustCard({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-2xl border border-[#A3B18A]/25 bg-[#1E3D34] text-[#FFF8EC] shadow-[0_18px_34px_rgba(30,61,52,0.16)] ${
        mobile
          ? "mx-auto px-4 py-3 text-sm"
          : "px-5 py-4 text-sm"
      }`}
    >
      <ShieldIcon />
      <span className="font-medium leading-5">
        Privacy-first. Safety built in. You&apos;re in control.
      </span>
    </div>
  );
}

function FeatureStrip() {
  const features = [
    ["Meaningful first conversation", "Guided Q&A helps you understand what matters."],
    ["Private decisions", "Choose to continue or pass respectfully."],
    ["Mutual choice", "Chat unlocks only when you both choose."],
    ["Safety built in", "Tools designed to keep you supported."],
    ["From connection to real dates", "Built-in tools for safer real-world plans."],
  ];

  return (
    <div className="hidden rounded-[1.6rem] border border-[#E6D4BE] bg-[#FFF8EC]/78 p-4 shadow-[0_22px_60px_rgba(30,61,52,0.08)] backdrop-blur lg:grid lg:grid-cols-5">
      {features.map(([title, body], index) => (
        <div
          key={title}
          className={`px-4 py-2 ${index > 0 ? "border-l border-[#E6D4BE]" : ""}`}
        >
          <p className="text-xs font-semibold leading-5 text-[#1E3D34]">
            {title}
          </p>
          <p className="mt-1 text-[0.72rem] leading-4 text-[#2B2B2B]/68">
            {body}
          </p>
        </div>
      ))}
    </div>
  );
}

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
              <span aria-hidden="true" className="text-xl leading-none">♥</span>
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

function LandingScreen() {
  return (
    <section className="relative isolate min-h-svh bg-[radial-gradient(circle_at_72%_44%,rgba(244,182,96,0.18),transparent_34%),linear-gradient(135deg,#FFF8EC_0%,#F5E6D3_58%,#F6C1B3_100%)] px-5 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-6xl flex-col justify-center gap-8 lg:gap-7">
        <div className="grid items-center gap-8 md:grid-cols-[0.82fr_1fr] md:gap-10 lg:gap-12">
          <div className="mx-auto flex w-full max-w-md flex-col items-center text-center md:mx-0 md:items-start md:text-left">
            <BrandMark centred />

            <div className="mt-7 h-px w-36 bg-[#E6D4BE] md:w-32" />
            <div className="-mt-[5px] mb-6 text-sm leading-none text-[#E07A5F]">
              ♥
            </div>

            <h1 className="max-w-[11ch] font-serif text-[3.15rem] font-medium leading-[0.96] tracking-[-0.02em] text-[#1E3D34] sm:text-[4.2rem] md:text-[4.4rem] lg:text-[5.15rem]">
              A calmer way to meet.
            </h1>

            <p className="mt-6 max-w-sm text-base leading-7 text-[#2B2B2B]/78 sm:text-lg md:text-base lg:text-lg">
              Guided Q&A helps you understand what matters before chat unlocks.
            </p>

            <div className="mt-8 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row md:items-start">
              <Link
                href="/demo"
                className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#E07A5F] px-9 text-base font-semibold text-[#FFF8EC] shadow-[0_18px_34px_rgba(224,122,95,0.22)] transition hover:bg-[#C96851] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1E3D34]/30 sm:w-auto"
              >
                Start demo
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/login"
                className="text-sm font-medium text-[#1E3D34] underline underline-offset-4 decoration-[#1E3D34]/25 transition hover:decoration-[#1E3D34]"
              >
                Already have an account?
              </Link>
            </div>

            <div className="mt-7 hidden md:block">
              <TrustCard />
            </div>
          </div>

          <div className="mx-auto w-full max-w-[23rem] md:max-w-none">
            <HeroPhoto />
          </div>

          <div className="md:hidden">
            <TrustCard mobile />
          </div>
        </div>

        <FeatureStrip />
      </div>
    </section>
  );
}

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <main className="min-h-svh overflow-x-hidden bg-[#FFF8EC] text-[#2B2B2B]">
      {showSplash ? (
        <SplashScreen onDiscover={() => setShowSplash(false)} />
      ) : (
        <LandingScreen />
      )}
    </main>
  );
}
