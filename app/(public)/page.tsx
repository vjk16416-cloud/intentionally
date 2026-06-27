import Link from "next/link";

const heroImageSrc: string | null = null;

function BrandMark() {
  return (
    <div className="flex items-center justify-center gap-3 md:justify-start">
      <div
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-full bg-[#1E3D34] shadow-[0_10px_30px_rgba(30,61,52,0.14)]"
      >
        <svg
          aria-hidden="true"
          className="size-5 text-[#E07A5F]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 20.2c-.3 0-.6-.1-.8-.3l-6-5.7C2.6 11.7 2.2 8 4.4 5.8c1.9-1.9 4.9-1.8 6.8.1l.8.8.8-.8c1.9-1.9 4.9-2 6.8-.1 2.2 2.2 1.8 5.9-.8 8.4l-6 5.7c-.2.2-.5.3-.8.3Z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-[#1E3D34]">Intentionally</p>
    </div>
  );
}

function BacklitFigure({
  side,
  className,
}: {
  side: "left" | "right";
  className: string;
}) {
  const isLeft = side === "left";

  return (
    <div
      aria-hidden="true"
      className={`absolute bottom-[12%] ${className}`}
    >
      <div
        className={`absolute top-0 h-[30%] w-[28%] bg-[#241C17]/70 blur-[0.2px] ${
          isLeft ? "left-[42%]" : "right-[42%]"
        }`}
        style={{
          borderRadius: isLeft
            ? "48% 52% 44% 48% / 42% 46% 54% 58%"
            : "52% 48% 48% 44% / 46% 42% 58% 54%",
        }}
      />
      <div
        className="absolute bottom-0 h-[78%] w-full bg-[linear-gradient(180deg,rgba(36,28,23,0.72),rgba(30,61,52,0.92))]"
        style={{
          borderRadius: isLeft
            ? "64% 42% 14% 24% / 58% 48% 16% 16%"
            : "42% 64% 24% 14% / 48% 58% 16% 16%",
          clipPath: isLeft
            ? "polygon(18% 100%, 9% 58%, 30% 24%, 50% 14%, 72% 28%, 88% 100%)"
            : "polygon(12% 100%, 28% 28%, 50% 14%, 70% 24%, 91% 58%, 82% 100%)",
        }}
      />
    </div>
  );
}

function HeroVisualPanel() {
  return (
    <div
      aria-label="Warm sunset connection visual"
      role="img"
      className="relative min-h-64 w-full overflow-hidden rounded-[2rem] border border-[#F6C1B3]/70 bg-[#E07A5F] shadow-[0_30px_90px_rgba(43,43,43,0.16)] sm:min-h-72 md:min-h-[500px] lg:min-h-[570px]"
      style={
        heroImageSrc
          ? {
              backgroundImage: `url(${heroImageSrc})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      {!heroImageSrc && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_32%_28%,rgba(255,248,236,0.92)_0%,rgba(245,230,211,0.6)_18%,rgba(244,182,96,0.28)_34%,transparent_52%),radial-gradient(ellipse_at_74%_20%,rgba(255,248,236,0.34)_0%,transparent_34%),linear-gradient(150deg,#FFF8EC_0%,#F6C1B3_34%,#E07A5F_68%,#C96550_100%)]" />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(43,43,43,0.18)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[linear-gradient(180deg,rgba(30,61,52,0)_0%,rgba(30,61,52,0.48)_42%,#1E3D34_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[36%] bg-[linear-gradient(180deg,rgba(30,61,52,0)_0%,#1E3D34_78%)]" />
      {!heroImageSrc && (
        <>
          <BacklitFigure
            side="left"
            className="left-[21%] h-[46%] w-[28%] sm:left-[25%] sm:h-[45%] sm:w-[23%]"
          />
          <BacklitFigure
            side="right"
            className="right-[19%] h-[50%] w-[31%] sm:right-[23%] sm:h-[48%] sm:w-[25%]"
          />
          <div className="absolute bottom-[11%] left-[22%] h-[20%] w-[56%] rounded-full bg-[#1E3D34]/45 blur-2xl" />
        </>
      )}
      <div className="absolute inset-x-[8%] bottom-[18%] h-px bg-[#FFF8EC]/24" />
      <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[radial-gradient(ellipse_at_center,rgba(163,177,138,0.32)_0%,rgba(30,61,52,0.24)_42%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,236,0.2)_0%,transparent_38%,rgba(43,43,43,0.06)_100%)]" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-svh overflow-x-hidden bg-[#FFF8EC] text-[#2B2B2B]">
      <section className="relative isolate flex min-h-svh flex-col bg-[radial-gradient(circle_at_50%_42%,rgba(244,182,96,0.2),transparent_34%),linear-gradient(180deg,#FFF8EC_0%,#F5E6D3_54%,#F6C1B3_100%)] px-5 py-6 sm:px-8 md:bg-[radial-gradient(circle_at_68%_42%,rgba(244,182,96,0.2),transparent_36%),linear-gradient(135deg,#FFF8EC_0%,#F5E6D3_56%,#F6C1B3_100%)] lg:px-10 lg:py-10">
        <div className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 md:grid-cols-[minmax(0,0.94fr)_minmax(360px,1.06fr)] lg:gap-14">
          <div className="flex min-h-[calc(100svh-3rem)] flex-col justify-between text-center md:min-h-0 md:justify-center md:py-12 md:text-left">
            <div className="space-y-7">
              <BrandMark />

              <div className="mx-auto max-w-xl space-y-5 md:mx-0">
                <h1 className="text-5xl font-semibold leading-[1.02] text-[#1E3D34] sm:text-6xl lg:text-7xl">
                  A calmer way to meet.
                </h1>
                <p className="mx-auto max-w-lg text-base leading-7 text-[#4F463F] sm:text-lg md:mx-0">
                  Guided Q&A helps you understand what matters before chat
                  unlocks.
                </p>
              </div>

              <div className="mx-auto max-w-md md:hidden">
                <HeroVisualPanel />
              </div>
            </div>

            <div className="mx-auto w-full max-w-md space-y-4 pb-2 pt-7 md:mx-0 md:max-w-none md:pb-0">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:flex-col md:items-start md:justify-start lg:flex-row lg:items-center">
                <Link
                  href="/demo"
                  className="inline-flex h-13 w-full items-center justify-center whitespace-nowrap rounded-2xl bg-[#E07A5F] px-8 text-base font-semibold text-[#FFF8EC] shadow-[0_16px_34px_rgba(224,122,95,0.28)] transition-colors hover:bg-[#C96851] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#1E3D34]/35 sm:w-auto"
                >
                  Start demo
                </Link>
                <Link
                  href="/login"
                  className="whitespace-nowrap text-sm font-semibold text-[#1E3D34] underline-offset-4 hover:underline"
                >
                  Already have an account?
                </Link>
              </div>

              <div className="rounded-2xl border border-[#A3B18A]/24 bg-[#1E3D34]/95 px-5 py-4 text-center text-sm font-semibold leading-6 text-[#FFF8EC] shadow-[0_18px_42px_rgba(30,61,52,0.16)] backdrop-blur md:max-w-md md:text-left">
                Privacy-first. Safety built in. You&apos;re in control.
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <HeroVisualPanel />
          </div>
        </div>
      </section>
    </main>
  );
}
