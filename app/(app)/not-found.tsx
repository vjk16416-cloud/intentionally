import { FallbackActionLink, FallbackPanel } from "@/components/fallback-state";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#f8f4ec] px-4 py-5">
      <div className="mx-auto flex min-h-[72vh] w-full max-w-md items-center md:max-w-2xl">
        <FallbackPanel
          eyebrow="Not found"
          title="This page is not available"
          description="The link may be out of date, or the page may have moved."
          note="You can go back to Discover and continue from there."
          action={<FallbackActionLink href="/discover">Back to Discover</FallbackActionLink>}
        />
      </div>
    </main>
  );
}
