import Link from "next/link";

const splashImageSrc = "/images/intentionally-splash-exact.png";

export default function HomePage() {
  return (
    <main className="min-h-svh overflow-hidden bg-[#071411] text-[#FFF8EC]">
      <section className="relative min-h-svh overflow-hidden bg-[#071411]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${splashImageSrc})` }}
        />

        <Link
          href="/login"
          aria-label="Discover more about Intentionally"
          className="absolute inset-0 z-20 flex items-end justify-center pb-[8svh] text-transparent focus-visible:text-[#13251F] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFF8EC]/60"
        >
          <span className="h-[8svh] w-[min(42vw,34rem)] rounded-[1.35rem]">
            Discover more
          </span>
        </Link>
      </section>
    </main>
  );
}
