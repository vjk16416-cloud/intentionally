"use server";

import { redirect } from "next/navigation";

import {
  BIO_ANSWER_MAX,
  BIO_PROMPT_KEYS,
} from "@/lib/onboarding/constants";
import { createClient } from "@/lib/supabase/server";

export type PromptActionState = {
  error?: string;
};

export async function savePrompt(
  _prev: PromptActionState,
  formData: FormData,
): Promise<PromptActionState> {
  const promptKey = String(formData.get("promptKey") ?? "");
  const answer = String(formData.get("answer") ?? "").trim();

  if (!BIO_PROMPT_KEYS.includes(promptKey)) {
    return { error: "Pick a prompt." };
  }
  if (!answer) {
    return { error: "Write a short answer." };
  }
  if (answer.length > BIO_ANSWER_MAX) {
    return { error: `Keep your answer under ${BIO_ANSWER_MAX} characters.` };
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
    .update({ bio_prompt_key: promptKey, bio_answer: answer })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect("/onboarding/neighbourhood");
}
