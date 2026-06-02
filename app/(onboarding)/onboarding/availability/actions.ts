"use server";

import { redirect } from "next/navigation";

import { isValidSlotIndex, MIN_SLOTS } from "@/lib/onboarding/availability";
import { resolveNextStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

export type AvailabilityActionState = {
  error?: string;
};

export async function saveAvailability(
  _prev: AvailabilityActionState,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const raw = String(formData.get("slots") ?? "");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Couldn't read your selection." };
  }

  if (!Array.isArray(parsed)) {
    return { error: "Couldn't read your selection." };
  }

  for (const s of parsed) {
    if (!isValidSlotIndex(s)) {
      return { error: "Invalid availability slot." };
    }
  }

  // Dedupe + sort for stable storage. The CHECK constraint guards
  // the value range; this guards uniqueness and order.
  const cleaned = Array.from(new Set(parsed as number[])).sort(
    (a, b) => a - b,
  );

  if (cleaned.length < MIN_SLOTS) {
    return {
      error: `Pick at least ${MIN_SLOTS / 2} hours of weekly availability.`,
    };
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
    .update({ availability: cleaned })
    .eq("id", user.id);
  if (error) {
    return { error: error.message };
  }

  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(resolveNextStep(returnTo, "/onboarding/trusted-contact"));
}
