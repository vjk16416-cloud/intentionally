"use server";

import { redirect } from "next/navigation";

import { resolveNextStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = {
  error?: string;
};

const NAME_MAX = 50;

export async function saveProfile(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();

  if (!displayName) {
    return { error: "Display name is required." };
  }
  if (displayName.length > NAME_MAX) {
    return { error: `Keep your display name under ${NAME_MAX} characters.` };
  }
  if (!dateOfBirth) {
    return { error: "Date of birth is required." };
  }

  // Parse as UTC midnight to avoid timezone drift on the 18+ comparison.
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(dob.getTime())) {
    return { error: "Enter a valid date." };
  }
  const now = new Date();
  const cutoff = new Date(
    Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()),
  );
  if (dob > cutoff) {
    return { error: "You must be 18 or older to use Intentionally." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, date_of_birth: dateOfBirth })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(resolveNextStep(returnTo, "/onboarding/identity"));
}
