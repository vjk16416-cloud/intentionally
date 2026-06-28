import Image from "next/image";
import Link from "next/link";

const heroImageSrc = "/images/intentionally-hero-sunset.jpg";

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-x-hidden bg-[#0B1714] text-[#FFF8EC]">
      <section className="relative min-h-svh overflow-hidden bg-[#0B1714] text-[#FFF8EC]">
        <Image
          src={heroImageSrc}
          alt="A couple sitting together at sunset by the water"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_58%] scale-[1.02]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,236,0.20)_0%,rgba(255,248,236,0.06)_24%,rgba(11,23,20,0.36)_58%,rgba(5,13,11,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(255,248,236,0.32),transparent_22%),radial-gradient(circle_at_50%_77%,rgba(224,122,95,0.18),transparent_34%),linear-gradient(90deg,rgba(5,13,11,0.30)_0%,transparent_21%,transparent_79%,rgba(5,13,11,0.30)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center px-5 pb-7 pt-9 text-center sm:px-8 sm:pb-10 sm:pt-10 lg:pb-12 lg:pt-12">
          <div className="flex w-full flex-1 flex-col items-center justify-between gap-6">
            <header className="flex flex-col items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E07A5F]/40 bg-[#FFF8EC]/18 text-lg text-[#E07A5F] shadow-[0_16px_40px_rgba(5,13,11,0.18)] backdrop-blur-md">
                ♥
              </div>
              <p className="mt-4 font-serif text-4xl font-medium tracking-[-0.035em] text-[#1E3D34] drop-shadow-[0_2px_22px_rgba(255,248,236,0.78)] sm:text-5xl">
                Intentionally
              </p>
            </header>

            <section className="w-full max-w-[39rem] rounded-[2rem] border border-[#FFF8EC]/12 bg-[#071411]/62 px-6 pb-6 pt-8 shadow-[0_26px_80px_rgba(5,13,11,0.34)] backdrop-blur-md sm:rounded-[2.4rem] sm:px-10 sm:pb-8 sm:pt-10">
              <h1 className="mx-auto max-w-xl font-serif text-[2.35rem] font-medium leading-[1.06] tracking-[-0.035em] text-[#FFF8EC] sm:text-[3.75rem] lg:text-[4.05rem]">
                Meaningful connections start with intention.
              </h1>

              <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-[#E07A5F]">
                <span className="h-px w-12 bg-[#FFF8EC]/34" />
                <span aria-hidden="true" className="text-lg leading-none">
                  ♥
                </span>
                <span className="h-px w-12 bg-[#FFF8EC]/34" />
              </div>

              <p className="mx-auto mt-5 max-w-[32rem] text-sm leading-7 text-[#FFF8EC]/84 sm:text-lg sm:leading-8">
                Guided conversations. Private choices. Chat unlocks only when you both choose.
              </p>

              <Link
                href="/login"
                className="mt-7 inline-flex h-15 min-h-15 w-full max-w-[34rem] items-center justify-center gap-3 rounded-[1.35rem] bg-[#E07A5F] px-8 text-base font-semibold text-[#FFF8EC] shadow-[0_18px_42px_rgba(224,122,95,0.34)] transition hover:-translate-y-0.5 hover:bg-[#C96851] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:h-[4.2rem] sm:text-xl"
              >
                Discover more
                <span aria-hidden="true" className="text-xl leading-none sm:text-2xl">
                  →
                </span>
              </Link>
            </section>

            <div className="flex items-center justify-center gap-2.5 pb-1" aria-hidden="true">
              <span className="h-1.5 w-12 rounded-full bg-[#E07A5F] shadow-[0_0_16px_rgba(224,122,95,0.45)] sm:w-14" />
              <span className="h-1.5 w-12 rounded-full bg-[#FFF8EC]/24 sm:w-14" />
              <span className="h-1.5 w-12 rounded-full bg-[#FFF8EC]/24 sm:w-14" />
              <span className="hidden h-1.5 w-14 rounded-full bg-[#FFF8EC]/24 sm:block" />
              <span className="hidden h-1.5 w-14 rounded-full bg-[#FFF8EC]/24 sm:block" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
