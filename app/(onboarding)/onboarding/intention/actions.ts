"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const INTENTION_VALUES = ["long-term", "short-term", "figuring-it-out"] as const;
type Intention = (typeof INTENTION_VALUES)[number];

function isIntention(value: string): value is Intention {
  return (INTENTION_VALUES as readonly string[]).includes(value);
}

export type IntentionActionState = {
  error?: string;
};

export async function saveIntention(
  _prev: IntentionActionState,
  formData: FormData,
): Promise<IntentionActionState> {
  const intention = String(formData.get("intention") ?? "");
  if (!isIntention(intention)) {
    return { error: "Pick what you're looking for." };
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
    .update({ intention })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding/prompt");
}
