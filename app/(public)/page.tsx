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
          className="object-cover object-[center_56%]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,236,0.16)_0%,rgba(255,248,236,0.04)_26%,rgba(13,30,26,0.40)_58%,rgba(5,13,11,0.90)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,248,236,0.30),transparent_20%),radial-gradient(circle_at_50%_76%,rgba(224,122,95,0.20),transparent_32%),linear-gradient(90deg,rgba(5,13,11,0.22)_0%,transparent_18%,transparent_82%,rgba(5,13,11,0.22)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-5xl flex-col items-center px-5 pb-8 pt-10 text-center sm:px-8 sm:pb-12 sm:pt-12 lg:pb-14 lg:pt-14">
          <div className="flex w-full flex-1 flex-col items-center justify-between gap-7">
            <header className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E07A5F]/45 bg-[#FFF8EC]/16 text-xl text-[#E07A5F] shadow-[0_16px_40px_rgba(5,13,11,0.18)] backdrop-blur-md">
                ♥
              </div>
              <p className="mt-5 font-serif text-4xl font-medium tracking-[-0.035em] text-[#1E3D34] drop-shadow-[0_2px_22px_rgba(255,248,236,0.72)] sm:text-5xl">
                Intentionally
              </p>
            </header>

            <section className="w-full max-w-[42rem] rounded-[2.25rem] border border-[#FFF8EC]/14 bg-[#061410]/68 px-6 pb-7 pt-9 shadow-[0_30px_90px_rgba(5,13,11,0.38)] backdrop-blur-md sm:rounded-[2.8rem] sm:px-10 sm:pb-9 sm:pt-12">
              <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#FFF8EC]/14 bg-[#FFF8EC]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#FFF8EC]/78">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E07A5F]" />
                Private by default
              </div>

              <h1 className="mx-auto max-w-xl font-serif text-[2.55rem] font-medium leading-[1.06] tracking-[-0.035em] text-[#FFF8EC] sm:text-[4.05rem] lg:text-[4.35rem]">
                Meaningful connections start with intention.
              </h1>

              <div className="mx-auto mt-7 flex items-center justify-center gap-3 text-[#E07A5F]">
                <span className="h-px w-12 bg-[#FFF8EC]/38" />
                <span aria-hidden="true" className="text-lg leading-none">
                  ♥
                </span>
                <span className="h-px w-12 bg-[#FFF8EC]/38" />
              </div>

              <p className="mx-auto mt-6 max-w-[35rem] text-base leading-8 text-[#FFF8EC]/86 sm:text-xl">
                Guided conversations. Private choices. Chat unlocks only when you both choose.
              </p>

              <Link
                href="/login"
                className="mt-9 inline-flex h-16 w-full max-w-[36rem] items-center justify-center gap-4 rounded-[1.45rem] bg-[#E07A5F] px-8 text-lg font-semibold text-[#FFF8EC] shadow-[0_18px_42px_rgba(224,122,95,0.34)] transition hover:-translate-y-0.5 hover:bg-[#C96851] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:h-[4.6rem] sm:text-xl"
              >
                Discover more
                <span aria-hidden="true" className="text-2xl leading-none">
                  →
                </span>
              </Link>
            </section>

            <div className="flex items-center justify-center gap-3 pb-1" aria-hidden="true">
              <span className="h-1.5 w-14 rounded-full bg-[#E07A5F] shadow-[0_0_16px_rgba(224,122,95,0.45)]" />
              <span className="h-1.5 w-14 rounded-full bg-[#FFF8EC]/26" />
              <span className="h-1.5 w-14 rounded-full bg-[#FFF8EC]/26" />
              <span className="hidden h-1.5 w-14 rounded-full bg-[#FFF8EC]/26 sm:block" />
              <span className="hidden h-1.5 w-14 rounded-full bg-[#FFF8EC]/26 sm:block" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
