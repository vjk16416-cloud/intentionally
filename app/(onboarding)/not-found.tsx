import { FallbackActionLink, FallbackPanel } from "@/components/fallback-state";

export default function NotFound() {
  return (
    <main className="min-h-[calc(100vh-57px)] bg-[#f8f4ec] px-4 py-5">
      <div className="mx-auto flex min-h-[72vh] w-full max-w-md items-center md:max-w-2xl">
        <FallbackPanel
          eyebrow="Not found"
          title="This step isn&apos;t available"
          description="The step may have moved, or your profile may already be past it."
          note="Go back to your profile review to continue."
          action={
            <FallbackActionLink href="/onboarding/review">
              Review profile
            </FallbackActionLink>
          }
        />
      </div>
    </main>
  );
}
