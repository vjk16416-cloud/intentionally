import { redirect } from "next/navigation";

import { StepShell } from "@/components/onboarding/step-shell";
import { getPreviousStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

import { PhotosForm } from "./photos-form";

export default async function PhotosStepPage({
  searchParams,
}: {
  searchParams: Promise<{ return?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const returnTo = params.return === "review" ? "/onboarding/review" : null;
  const previousStep = getPreviousStep("/onboarding/photos");

  const { data: profile } = await supabase
    .from("profiles")
    .select("photos")
    .eq("id", user.id)
    .maybeSingle<{ photos: string[] | null }>();

  return (
    <StepShell
      stepLabel="Step 3 of 8"
      title="Add photos that feel like you"
      description="Choose recent photos where your face is clear and the lighting is natural. Avoid heavy filters. The aim is to help someone recognise the real you before a Guided Vibe Check."
      progress={38}
      className="mx-auto w-full max-w-md"
    >
      <PhotosForm
        userId={user.id}
        initialPaths={profile?.photos ?? []}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </StepShell>
  );
}
