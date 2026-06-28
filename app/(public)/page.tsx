import Link from "next/link";

const splashImageSrc = "/images/intentionally-splash-exact.png";

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
      <section className="relative min-h-svh overflow-hidden bg-[#071411]">
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-70 blur-2xl"
          style={{ backgroundImage: `url(${splashImageSrc})` }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${splashImageSrc})` }}
        />

        <Link
          href="/login"
          aria-label="Discover more about Intentionally"
          className="absolute left-1/2 top-[75.5%] z-20 flex h-[7.2%] w-[min(38vw,30rem)] -translate-x-1/2 items-center justify-center rounded-[1.35rem] text-transparent focus-visible:text-[#13251F] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/60"
        >
          Discover more
        </Link>
      </section>
    </main>
  );
}
