"use server";

import { redirect } from "next/navigation";

import { isValidMarket } from "@/lib/onboarding/constants";
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
    return { error: "Pick your city." };
  }
  if (!neighbourhood) {
    return { error: "Pick your neighbourhood." };
  }
  if (!isValidMarket(city, neighbourhood)) {
    return { error: "Pick a neighbourhood from the list." };
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

  redirect("/onboarding/trusted-contact");
}
