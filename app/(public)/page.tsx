import Image from "next/image";
import Link from "next/link";

const splashImageSrc = "/images/intentionally-hero-sunset.jpg";

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
      <section className="relative isolate min-h-svh overflow-hidden bg-[#071411] text-center">
        <Image
          src={splashImageSrc}
          alt="Two people holding hands outdoors in a calm natural landscape"
          fill
          priority
          sizes="100vw"
          className="-z-30 object-cover object-[center_58%] sm:object-[center_55%] lg:object-[center_52%]"
        />

        <div className="absolute inset-0 -z-20 bg-[#071411]/46" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,13,11,0.16)_0%,rgba(5,13,11,0.22)_36%,rgba(5,13,11,0.58)_100%)]" />

        <div className="relative z-10 min-h-svh w-full px-5 sm:px-8">
          <header className="absolute left-1/2 top-[6.2svh] flex -translate-x-1/2 flex-col items-center sm:top-[6.8svh] lg:top-[7.2svh]">
            <div className="text-[3rem] leading-none text-[#F3A17F] drop-shadow-[0_6px_18px_rgba(5,13,11,0.35)] sm:text-[3.5rem] lg:text-[4rem]">
              ♡
            </div>
            <p className="mt-3 font-serif text-[clamp(2.8rem,10vw,4.6rem)] font-medium leading-none tracking-[-0.045em] text-[#FFF8EC] drop-shadow-[0_5px_28px_rgba(5,13,11,0.66)]">
              Intentionally
            </p>
            <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-[#F3A17F] sm:text-sm">
              Dating with purpose.
            </p>
          </header>

          <section className="absolute left-1/2 top-[30svh] w-[min(86vw,36rem)] -translate-x-1/2 rounded-[1.9rem] border border-white/22 bg-[#0F1412]/46 px-6 py-8 shadow-[0_30px_90px_rgba(5,13,11,0.48)] backdrop-blur-[14px] sm:top-[30.5svh] sm:rounded-[2rem] sm:px-9 sm:py-9 lg:top-[31svh] lg:w-[min(56vw,38rem)] lg:px-10 lg:py-10">
            <div className="mx-auto mb-5 flex h-12 w-20 items-center justify-center text-[2.5rem] leading-none text-[#F3A17F] sm:mb-6 sm:text-5xl">
              ♡♡
            </div>

            <h1 className="mx-auto max-w-[31rem] font-serif text-[clamp(1.9rem,7vw,2.45rem)] font-medium leading-[1.16] tracking-[-0.035em] text-[#FFF8EC] sm:text-[2.65rem] lg:text-[2.85rem]">
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

            <Link
              href="/login"
              aria-label="Discover more about Intentionally"
              className="mx-auto mt-8 inline-flex h-16 w-[min(100%,28rem)] items-center justify-center gap-5 rounded-2xl bg-[#F3A17F] px-8 text-base font-semibold text-[#13251F] shadow-[0_20px_46px_rgba(224,122,95,0.34)] transition duration-200 hover:bg-[#EA9270] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/35 sm:text-xl"
            >
              Discover more
              <span aria-hidden="true" className="text-2xl leading-none">
                →
              </span>
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
