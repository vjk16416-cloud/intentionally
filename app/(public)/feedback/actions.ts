"use server";

import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";

import { parseFeedbackForm } from "@/lib/user-testing/feedback";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";

export type FeedbackActionState = {
  status?: "success";
  error?: string;
};

export async function submitUserTestingFeedback(
  _prev: FeedbackActionState,
  formData: FormData,
): Promise<FeedbackActionState> {
  const parsed = parseFeedbackForm(formData);

  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const supabase = createSupabaseServiceClient(
    SUPABASE_URL,
    getServiceRoleKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

  const { error } = await supabase
    .from("user_testing_feedback")
    .insert(parsed.data);

  if (error) {
    return {
      error:
        "We could not save your feedback just now. Please try again in a moment.",
    };
  }

  return { status: "success" };
}
