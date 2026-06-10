import { redirect } from "next/navigation";

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
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Step 3 of 8
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Add photos that feel like you
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Choose recent photos where your face is clear and the lighting is
          natural. Avoid heavy filters — the aim is to help someone recognise
          the real you before a guided Q&amp;A.
        </p>
      </header>
      <PhotosForm
        userId={user.id}
        initialPaths={profile?.photos ?? []}
        returnTo={returnTo}
        previousStep={previousStep}
      />
    </div>
  );
}
