import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
      <section className="relative isolate flex min-h-svh overflow-hidden bg-[#071411] px-5 py-[max(1.25rem,env(safe-area-inset-top))] text-center sm:px-8">
        <div className="absolute inset-0 -z-30 bg-[#071411]" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_18%_68%,rgba(243,161,127,0.42)_0%,rgba(243,161,127,0.15)_18%,transparent_36%),radial-gradient(circle_at_78%_24%,rgba(243,161,127,0.34)_0%,rgba(243,161,127,0.12)_16%,transparent_34%),linear-gradient(135deg,#06110F_0%,#10231D_45%,#071411_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_56%,rgba(0,0,0,0.62)_100%)]" />
        <div aria-hidden="true" className="absolute left-[8%] top-[63%] -z-10 h-px w-[86vw] max-w-[62rem] -rotate-[18deg] bg-gradient-to-r from-transparent via-[#F3A17F]/30 to-transparent" />
        <div aria-hidden="true" className="absolute left-[22%] top-[58%] -z-10 h-[36rem] w-[36rem] rounded-full border border-[#F3A17F]/10" />

        <div className="mx-auto flex min-h-[calc(100svh-2.5rem)] w-full max-w-[36rem] flex-col items-center justify-center gap-5 py-3 sm:max-w-[40rem] sm:gap-7 md:max-w-[45rem] lg:max-w-[50rem]">
          <header className="flex shrink-0 flex-col items-center">
            <div className="text-[2.8rem] leading-none text-[#F3A17F] drop-shadow-[0_0_24px_rgba(243,161,127,0.24)] sm:text-[3.35rem]">
              ♡
            </div>
            <p className="mt-3 font-serif text-[clamp(2.65rem,13vw,4.5rem)] font-medium leading-none tracking-[-0.045em] text-[#FFF8EC] drop-shadow-[0_5px_28px_rgba(5,13,11,0.72)]">
              Intentionally
            </p>
            <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#F3A17F] sm:text-sm">
              Dating with purpose.
            </p>
          </header>

          <section className="w-full rounded-[2rem] border border-[#FFF8EC]/18 bg-[#0F1412]/58 px-6 py-7 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-[18px] sm:rounded-[2.25rem] sm:px-10 sm:py-9 lg:px-12 lg:py-10">
            <div className="mx-auto mb-5 flex h-11 w-20 items-center justify-center text-[2.45rem] leading-none text-[#F3A17F] sm:mb-6 sm:text-5xl">
              ♡♡
            </div>

            <h1 className="mx-auto max-w-[33rem] font-serif text-[clamp(2rem,8vw,2.75rem)] font-medium leading-[1.13] tracking-[-0.035em] text-[#FFF8EC] sm:text-[3rem] lg:text-[3.15rem]">
              Meaningful connections
              <br />
              start with <span className="text-[#F3A17F]">intention</span>.
            </h1>

            <div className="mx-auto mt-6 flex max-w-[24rem] items-center justify-center gap-4 text-[#F3A17F]">
              <span className="h-px flex-1 bg-[#FFF8EC]/24" />
              <span aria-hidden="true" className="text-lg leading-none">
                ♡
              </span>
              <span className="h-px flex-1 bg-[#FFF8EC]/24" />
            </div>

            <p className="mx-auto mt-5 max-w-[31rem] text-[0.98rem] leading-7 text-[#FFF8EC]/88 sm:text-lg sm:leading-8">
              Guided conversations. Private choices.
              <br className="hidden sm:block" />
              Chat unlocks only when you both choose.
            </p>

            <Link
              href="/login"
              aria-label="Discover more about Intentionally"
              className="mx-auto mt-8 inline-flex h-16 w-[min(100%,28rem)] items-center justify-center gap-5 rounded-2xl bg-[#F3A17F] px-8 text-base font-semibold text-[#13251F] shadow-[0_20px_46px_rgba(243,161,127,0.28)] transition duration-200 hover:bg-[#EA9270] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:text-xl"
            >
              Discover more
              <span aria-hidden="true" className="text-2xl leading-none">
                →
              </span>
            </Link>
          </section>

          <div className="grid w-full max-w-[42rem] grid-cols-2 gap-3 text-left text-[0.72rem] text-[#FFF8EC]/78 sm:grid-cols-4 sm:text-xs">
            <div className="rounded-2xl border border-[#FFF8EC]/10 bg-[#FFF8EC]/5 px-3 py-3 backdrop-blur-sm"><span className="block text-[#F3A17F]">♡</span>Privacy first</div>
            <div className="rounded-2xl border border-[#FFF8EC]/10 bg-[#FFF8EC]/5 px-3 py-3 backdrop-blur-sm"><span className="block text-[#F3A17F]">◇</span>Guided talks</div>
            <div className="rounded-2xl border border-[#FFF8EC]/10 bg-[#FFF8EC]/5 px-3 py-3 backdrop-blur-sm"><span className="block text-[#F3A17F]">✓</span>Mutual choice</div>
            <div className="rounded-2xl border border-[#FFF8EC]/10 bg-[#FFF8EC]/5 px-3 py-3 backdrop-blur-sm"><span className="block text-[#F3A17F]">→</span>Built for real</div>
          </div>
        </div>
      </section>
    </main>
  );
}
