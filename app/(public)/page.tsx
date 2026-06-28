import Link from "next/link";

const splashBackgroundSrc = "/images/intentionally-splash-bg-wide.png";

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
      <section className="relative min-h-svh overflow-hidden bg-[#071411] text-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${splashBackgroundSrc})` }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,13,11,0.22)_0%,rgba(5,13,11,0.08)_42%,rgba(5,13,11,0.40)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-[62rem] flex-col items-center px-5 pt-[7svh] sm:px-8 lg:pt-[8svh]">
          <header className="flex flex-col items-center">
            <div className="text-5xl leading-none text-[#F0A085] sm:text-6xl">♡</div>
            <p className="mt-5 font-serif text-5xl font-medium tracking-[-0.04em] text-[#FFF8EC] drop-shadow-[0_4px_24px_rgba(5,13,11,0.58)] sm:text-6xl lg:text-7xl">
              Intentionally
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.34em] text-[#F0A085] sm:text-sm">
              Dating with purpose.
            </p>
          </header>

          <section className="mt-[6svh] w-[min(88vw,38rem)] rounded-[2.25rem] border border-[#FFF8EC]/18 bg-[#071411]/66 px-6 pb-7 pt-8 shadow-[0_28px_90px_rgba(5,13,11,0.38)] backdrop-blur-md sm:mt-[7svh] sm:rounded-[2.7rem] sm:px-10 sm:pb-9 sm:pt-10">
            <div className="mx-auto mb-7 flex h-14 w-20 items-center justify-center text-4xl text-[#F0A085]">
              ♡♡
            </div>

            <h1 className="mx-auto max-w-xl font-serif text-[2.2rem] font-medium leading-[1.08] tracking-[-0.035em] text-[#FFF8EC] sm:text-[3.25rem] lg:text-[3.65rem]">
              Meaningful connections start with <span className="text-[#F0A085]">intention</span>.
            </h1>

            <div className="mx-auto mt-6 flex items-center justify-center gap-3 text-[#F0A085]">
              <span className="h-px w-14 bg-[#FFF8EC]/24" />
              <span aria-hidden="true" className="text-lg leading-none">
                ♡
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
