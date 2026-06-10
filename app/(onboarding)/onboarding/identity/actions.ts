"use server";

import { redirect } from "next/navigation";

import { resolveNextStep } from "@/lib/onboarding/navigation";
import { createClient } from "@/lib/supabase/server";

const GENDER_VALUES = ["woman", "man", "non-binary"] as const;
type Gender = (typeof GENDER_VALUES)[number];

function isGender(value: string): value is Gender {
  return (GENDER_VALUES as readonly string[]).includes(value);
}

export type IdentityActionState = {
  error?: string;
};

export async function saveIdentity(
  _prev: IdentityActionState,
  formData: FormData,
): Promise<IdentityActionState> {
  const gender = String(formData.get("gender") ?? "");
  if (!isGender(gender)) {
    return { error: "Choose how you describe yourself." };
  }

  const seeking = formData.getAll("seeking").map(String);
  if (seeking.length === 0) {
    return { error: "Choose at least one option you are open to meeting." };
  }
  for (const value of seeking) {
    if (!isGender(value)) {
      return { error: "Invalid selection." };
    }
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
    .update({ gender, seeking })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  const returnTo = String(formData.get("returnTo") ?? "");
  redirect(resolveNextStep(returnTo, "/onboarding/photos"));
}
