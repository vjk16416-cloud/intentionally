"use server";

import { redirect } from "next/navigation";

import { LONDON_NEIGHBOURHOOD_SET } from "@/lib/onboarding/constants";
import { createClient } from "@/lib/supabase/server";

export type NeighbourhoodActionState = {
  error?: string;
};

export async function saveNeighbourhood(
  _prev: NeighbourhoodActionState,
  formData: FormData,
): Promise<NeighbourhoodActionState> {
  const neighbourhood = String(formData.get("neighbourhood") ?? "");
  if (!LONDON_NEIGHBOURHOOD_SET.has(neighbourhood)) {
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
    .update({ neighbourhood })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding/trusted-contact");
}
