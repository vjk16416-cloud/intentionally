import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-xl space-y-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Intentionally
        </h1>
        <p className="text-lg text-muted-foreground">
          Video-first dating. Ten minutes of structured Q&amp;A before chat
          unlocks — designed for higher-signal matches.
        </p>
        <div className="flex justify-center">
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Get started
          </Link>
        </div>
      </div>
    </main>
  );
}
