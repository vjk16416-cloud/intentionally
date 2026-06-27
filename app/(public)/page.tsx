import Link from "next/link";

const features = [
  {
    title: "Meaningful first conversations",
    description: "Guided Q&A helps you understand what matters.",
  },
  {
    title: "Private decisions",
    description:
      "You choose to continue or pass privately and respectfully.",
  },
  {
    title: "Mutual choice only",
    description: "Chat unlocks only when you both choose to.",
  },
  {
    title: "Safety built in",
    description: "Tools and reporting features keep you safe and supported.",
  },
  {
    title: "From connection to real dates",
    description:
      "Built-in tools help move from conversation to safer real-world dates.",
  },
];

function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-3 lg:justify-start">
      <div
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-full bg-[#1E3D34] shadow-[0_10px_30px_rgba(30,61,52,0.18)]"
      >
        <span className="size-3 rounded-full bg-[#E07A5F]" />
      </div>
      <p className="text-base font-semibold text-[#1E3D34]">Intentionally</p>
    </div>
  );
}

function SunsetPanel() {
  return (
    <div
      aria-label="Warm abstract sunset relationship visual"
      role="img"
      className="relative min-h-52 w-full overflow-hidden rounded-[2rem] border border-[#F6C1B3]/60 bg-[#F4B660] shadow-[0_24px_70px_rgba(43,43,43,0.14)] sm:min-h-72 lg:min-h-[560px]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(255,248,236,0.92)_0_12%,transparent_13%),radial-gradient(circle_at_68%_28%,rgba(255,248,236,0.86)_0_10%,transparent_11%),linear-gradient(145deg,#FFF8EC_0%,#F6C1B3_32%,#E07A5F_66%,#1E3D34_100%)]" />
      <div className="absolute left-1/2 top-[18%] h-44 w-44 -translate-x-1/2 rounded-full bg-[#F4B660]/80 blur-2xl sm:h-64 sm:w-64" />
      <div className="absolute bottom-0 left-0 right-0 h-[46%] rounded-t-[55%] bg-[#1E3D34]" />
      <div className="absolute bottom-[18%] left-[12%] h-24 w-28 rounded-t-full rounded-bl-[3rem] rounded-br-[1rem] bg-[#FFF8EC]/88 shadow-[0_18px_40px_rgba(30,61,52,0.16)] sm:h-36 sm:w-40 lg:left-[15%]" />
      <div className="absolute bottom-[19%] right-[13%] h-28 w-28 rounded-t-full rounded-bl-[1.5rem] rounded-br-[3.5rem] bg-[#F5E6D3]/92 shadow-[0_18px_40px_rgba(30,61,52,0.16)] sm:h-40 sm:w-40 lg:right-[16%]" />
      <div className="absolute bottom-[30%] left-[28%] h-16 w-16 rounded-full bg-[#2B2B2B]/12 sm:h-24 sm:w-24" />
      <div className="absolute bottom-[31%] right-[29%] h-16 w-16 rounded-full bg-[#2B2B2B]/12 sm:h-24 sm:w-24" />
      <div className="absolute bottom-[12%] left-1/2 h-16 w-[58%] -translate-x-1/2 rounded-full bg-[#A3B18A]/70 blur-xl" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-svh overflow-x-hidden bg-[#FFF8EC] text-[#2B2B2B]">
      <section className="relative isolate flex min-h-svh flex-col bg-[linear-gradient(180deg,#FFF8EC_0%,#F5E6D3_56%,#F6C1B3_100%)] px-5 py-6 sm:px-8 lg:min-h-0 lg:bg-[linear-gradient(135deg,#FFF8EC_0%,#F5E6D3_52%,#F6C1B3_100%)] lg:px-10 lg:py-10">
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(440px,1.08fr)] lg:gap-12">
          <div className="flex min-h-[calc(100svh-3rem)] flex-col justify-between text-center lg:min-h-0 lg:justify-center lg:py-12 lg:text-left">
            <div className="space-y-7">
              <BrandMark />

              <div className="mx-auto max-w-xl space-y-5 lg:mx-0">
                <h1 className="text-5xl font-semibold leading-[1.02] text-[#1E3D34] sm:text-6xl lg:text-7xl">
                  A calmer way to meet.
                </h1>
                <p className="mx-auto max-w-lg text-base leading-7 text-[#4F463F] sm:text-lg lg:mx-0">
                  Guided Q&A, private decisions and mutual choice before chat
                  unlocks.
                </p>
              </div>

              <div className="mx-auto max-w-md lg:hidden">
                <SunsetPanel />
              </div>
            </div>

            <div className="mx-auto w-full max-w-md space-y-4 pb-2 pt-7 lg:mx-0 lg:max-w-none lg:pb-0">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/demo"
                  className="inline-flex h-13 w-full items-center justify-center rounded-2xl bg-[#E07A5F] px-8 text-base font-semibold text-[#FFF8EC] shadow-[0_16px_34px_rgba(224,122,95,0.28)] transition-colors hover:bg-[#C96851] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1E3D34]/35 sm:w-auto"
                >
                  Start demo
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#1E3D34] underline-offset-4 hover:underline"
                >
                  Already have an account?
                </Link>
              </div>

              <div className="rounded-2xl bg-[#1E3D34] px-5 py-4 text-center text-sm font-medium leading-6 text-[#FFF8EC] shadow-[0_16px_36px_rgba(30,61,52,0.16)] lg:max-w-md lg:text-left">
                Privacy-first. Safety built in. You&apos;re in control.
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <SunsetPanel />
          </div>
        </div>
      </section>

      <section
        aria-label="How Intentionally works"
        className="border-t border-[#E07A5F]/20 bg-[#FFF8EC] px-5 py-8 sm:px-8 lg:px-10 lg:py-12"
      >
        <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[#F5E6D3] bg-white/55 p-5 shadow-[0_12px_30px_rgba(43,43,43,0.05)]"
            >
              <h2 className="text-base font-semibold leading-6 text-[#1E3D34]">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#5B5149]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
