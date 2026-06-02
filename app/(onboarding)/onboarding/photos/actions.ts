"use server";

import { redirect } from "next/navigation";

import { resolveNextStep } from "@/lib/onboarding/navigation";
import { isOwnedBy } from "@/lib/storage/photos";
import { createClient } from "@/lib/supabase/server";

export type SavePhotosState = {
  error?: string;
};

const MIN_PHOTOS = 2;
const MAX_PHOTOS = 6;

export async function savePhotos(
  _prev: SavePhotosState,
  formData: FormData,
): Promise<SavePhotosState> {
  const paths = formData.getAll("paths").map(String).filter(Boolean);

  if (paths.length < MIN_PHOTOS) {
    return { error: `Upload at least ${MIN_PHOTOS} photos.` };
  }
  if (paths.length > MAX_PHOTOS) {
    return { error: `Up to ${MAX_PHOTOS} photos.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  for (const path of paths) {
    if (!isOwnedBy(path, user.id)) {
      return { error: "One or more uploads didn't match your account." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ photos: paths })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(resolveNextStep(returnTo, "/onboarding/intention"));
}
