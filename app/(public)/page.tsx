import Image from "next/image";
import Link from "next/link";

const heroImageSrc = "/images/intentionally-hero-sunset.jpg";

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
      <section className="relative min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
        <Image
          src={heroImageSrc}
          alt="Two people holding hands in a calm outdoor setting"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_54%]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(241,232,218,0.08)_0%,rgba(11,23,20,0.18)_36%,rgba(5,13,11,0.50)_72%,rgba(5,13,11,0.74)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(241,232,218,0.16),transparent_24%),radial-gradient(circle_at_50%_66%,rgba(224,122,95,0.14),transparent_32%)]" />

        <div className="relative z-10 min-h-svh w-full px-5 text-center sm:px-8">
          <header className="absolute left-1/2 top-[7svh] flex -translate-x-1/2 flex-col items-center sm:top-[7.5svh]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#F0A085]/35 bg-[#FFF8EC]/12 text-2xl text-[#F0A085] shadow-[0_18px_42px_rgba(5,13,11,0.24)] backdrop-blur-md">
              ♥
            </div>
            <p className="mt-5 font-serif text-5xl font-medium tracking-[-0.04em] text-[#FFF8EC] drop-shadow-[0_4px_24px_rgba(5,13,11,0.58)] sm:text-6xl lg:text-7xl">
              Intentionally
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.34em] text-[#F0A085] sm:text-sm">
              Dating with purpose.
            </p>
          </header>

          <section className="absolute left-1/2 top-[31svh] w-[min(88vw,38rem)] -translate-x-1/2 rounded-[2.25rem] border border-[#FFF8EC]/16 bg-[#071411]/68 px-6 pb-7 pt-8 shadow-[0_28px_90px_rgba(5,13,11,0.40)] backdrop-blur-md sm:top-[32svh] sm:rounded-[2.7rem] sm:px-10 sm:pb-9 sm:pt-10">
            <div className="mx-auto mb-7 flex h-14 w-20 items-center justify-center text-4xl text-[#F0A085]">
              ♥♥
            </div>

            <h1 className="mx-auto max-w-xl font-serif text-[2.2rem] font-medium leading-[1.08] tracking-[-0.035em] text-[#FFF8EC] sm:text-[3.25rem] lg:text-[3.65rem]">
              Meaningful connections start with intention.
            </h1>

            <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-[#F0A085]">
              <span className="h-px w-14 bg-[#FFF8EC]/24" />
              <span aria-hidden="true" className="text-lg leading-none">
                ♥
              </span>
              <span className="h-px w-14 bg-[#FFF8EC]/24" />
            </div>

            <p className="mx-auto mt-5 max-w-[32rem] text-sm leading-7 text-[#FFF8EC]/86 sm:text-lg sm:leading-8">
              Guided conversations. Private choices. Chat unlocks only when you both choose.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex h-15 min-h-15 w-full items-center justify-center gap-4 rounded-[1.35rem] bg-[#F2A17F] px-8 text-base font-semibold text-[#13251F] shadow-[0_20px_46px_rgba(224,122,95,0.34)] transition hover:-translate-y-0.5 hover:bg-[#F4B093] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:h-[4.2rem] sm:text-xl"
            >
              Discover more
              <span aria-hidden="true" className="text-xl leading-none sm:text-2xl">
                →
              </span>
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
