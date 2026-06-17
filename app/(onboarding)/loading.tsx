import { FallbackLoading } from "@/components/fallback-state";

export default function Loading() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#f8f4ec] px-4 py-5">
      <div className="mx-auto flex min-h-[72vh] w-full max-w-md items-center md:max-w-2xl">
        <FallbackLoading
          eyebrow="Loading"
          title="Preparing your setup"
          description="We&apos;re loading the next step and your saved details."
        />
      </div>
    </main>
  );
}
