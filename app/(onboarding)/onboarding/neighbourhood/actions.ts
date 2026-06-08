"use server";

import { redirect } from "next/navigation";

import { resolveNextStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

export type NeighbourhoodActionState = {
  error?: string;
};

export async function saveNeighbourhood(
  _prev: NeighbourhoodActionState,
  formData: FormData,
): Promise<NeighbourhoodActionState> {
  const city = String(formData.get("city") ?? "").trim();
  const neighbourhood = String(formData.get("neighbourhood") ?? "").trim();

  if (!city) {
    return { error: "Enter your city or town." };
  }

  if (city.length < 2) {
    return { error: "City or town must be at least 2 characters." };
  }

  if (!neighbourhood) {
    return { error: "Enter your neighbourhood or area." };
  }

  if (neighbourhood.length < 2) {
    return { error: "Neighbourhood or area must be at least 2 characters." };
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
    .update({ city, neighbourhood })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(resolveNextStep(returnTo, "/onboarding/availability"));
}
