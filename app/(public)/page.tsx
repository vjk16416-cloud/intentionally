import Link from "next/link";

const proofPoints = [
  { icon: "◌", label: "Private pace" },
  { icon: "?", label: "Guided Q&A" },
  { icon: "✓", label: "Mutual unlock" },
  { icon: "♡", label: "Real intention" },
];

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
      <section className="relative isolate flex min-h-svh overflow-hidden bg-[#071411] px-4 py-[max(1rem,env(safe-area-inset-top))] text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-30 bg-[#071411]" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_14%_70%,rgba(243,161,127,0.34)_0%,rgba(243,161,127,0.13)_17%,transparent_36%),radial-gradient(circle_at_80%_20%,rgba(243,161,127,0.28)_0%,rgba(243,161,127,0.1)_15%,transparent_34%),linear-gradient(135deg,#050D0B_0%,#11241E_46%,#071411_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_42%,rgba(255,248,236,0.05)_0%,transparent_32%),radial-gradient(circle_at_center,transparent_0%,transparent_58%,rgba(0,0,0,0.64)_100%)]" />
        <div aria-hidden="true" className="absolute left-[7%] top-[62%] -z-10 h-px w-[88vw] max-w-[64rem] -rotate-[18deg] bg-gradient-to-r from-transparent via-[#F3A17F]/24 to-transparent" />
        <div aria-hidden="true" className="absolute left-[18%] top-[58%] -z-10 h-[32rem] w-[32rem] rounded-full border border-[#F3A17F]/8 sm:h-[40rem] sm:w-[40rem]" />

        <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[34rem] flex-col items-center justify-center gap-4 py-2 sm:max-w-[40rem] sm:gap-5 md:max-w-[45rem] lg:max-w-[53rem] xl:max-w-[56rem]">
          <header className="flex shrink-0 flex-col items-center">
            <div className="text-[2.35rem] leading-none text-[#F3A17F] drop-shadow-[0_0_24px_rgba(243,161,127,0.24)] sm:text-[2.8rem] lg:text-[3.1rem]">
              ♡
            </div>
            <p className="mt-2 font-serif text-[clamp(2.35rem,10.5vw,4.15rem)] font-medium leading-none tracking-[-0.045em] text-[#FFF8EC] drop-shadow-[0_5px_28px_rgba(5,13,11,0.72)] sm:mt-3">
              Intentionally
            </p>
            <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-[#F3A17F] sm:mt-3 sm:text-sm sm:tracking-[0.34em]">
              Dating with purpose.
            </p>
          </header>

          <section className="w-full rounded-[1.65rem] border border-[#FFF8EC]/18 bg-[#0D1714]/64 px-5 py-6 shadow-[0_28px_86px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,248,236,0.08)] backdrop-blur-[20px] sm:rounded-[2.1rem] sm:px-9 sm:py-8 lg:rounded-[2.35rem] lg:px-12 lg:py-9">
            <div className="mx-auto mb-4 flex h-9 w-16 items-center justify-center text-[2rem] leading-none text-[#F3A17F] sm:mb-5 sm:h-11 sm:w-20 sm:text-[2.55rem] lg:text-[2.85rem]">
              ♡♡
            </div>

            <p className="mb-3 text-[0.67rem] font-semibold uppercase tracking-[0.28em] text-[#F3A17F]/90 sm:text-xs">
              Safer, slower, more intentional
            </p>

            <h1 className="mx-auto max-w-[33rem] font-serif text-[clamp(1.82rem,7.6vw,2.45rem)] font-medium leading-[1.12] tracking-[-0.035em] text-[#FFF8EC] sm:text-[2.72rem] lg:text-[2.95rem]">
              Meaningful connections
              <br />
              start with <span className="text-[#F3A17F]">intention</span>.
            </h1>

            <div className="mx-auto mt-5 flex max-w-[23rem] items-center justify-center gap-4 text-[#F3A17F] sm:mt-6">
              <span className="h-px flex-1 bg-[#FFF8EC]/22" />
              <span aria-hidden="true" className="text-base leading-none sm:text-lg">
                ♡
              </span>
              <span className="h-px flex-1 bg-[#FFF8EC]/22" />
            </div>

            <p className="mx-auto mt-4 max-w-[31rem] text-[0.92rem] leading-6 text-[#FFF8EC]/88 sm:mt-5 sm:text-lg sm:leading-8">
              Guided conversations. Private choices.
              <br className="hidden sm:block" />
              Chat unlocks only when you both choose.
            </p>

            <Link
              href="/login"
              aria-label="Discover more about Intentionally"
              className="mx-auto mt-6 inline-flex h-14 w-full max-w-[26rem] items-center justify-center gap-4 rounded-[1.1rem] bg-[#F3A17F] px-7 text-base font-semibold text-[#13251F] shadow-[0_20px_46px_rgba(243,161,127,0.26)] transition duration-200 hover:bg-[#EA9270] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:mt-8 sm:h-16 sm:gap-5 sm:rounded-2xl sm:text-xl"
            >
              Discover more
              <span aria-hidden="true" className="text-xl leading-none sm:text-2xl">
                →
              </span>
            </Link>
          </section>

          <div className="hidden w-full max-w-[41rem] grid-cols-4 gap-3 text-left text-xs text-[#FFF8EC]/80 md:grid">
            {proofPoints.map((item) => (
              <div key={item.label} className="rounded-2xl border border-[#FFF8EC]/10 bg-[#FFF8EC]/5 px-4 py-3 backdrop-blur-sm">
                <span className="block text-sm text-[#F3A17F]">{item.icon}</span>
                <span className="mt-1 block font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
