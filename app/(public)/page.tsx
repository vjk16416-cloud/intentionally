import Image from "next/image";
import Link from "next/link";

const heroImageSrc = "/images/intentionally-hero-sunset.jpg";

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-x-hidden bg-[#0D1E1A] text-[#FFF8EC]">
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

              <Link
                href="/login"
                className="mt-10 inline-flex h-16 w-full max-w-[38rem] items-center justify-center gap-5 rounded-[1.7rem] bg-[#E07A5F] px-8 text-xl font-semibold tracking-wide text-[#FFF8EC] shadow-[0_18px_42px_rgba(224,122,95,0.34)] transition hover:bg-[#C96851] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:h-20 sm:text-2xl"
              >
                Discover more
                <span aria-hidden="true">→</span>
              </Link>
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
    </main>
  );
}
