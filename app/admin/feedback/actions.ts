"use server";

import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import { requireFounder } from "@/lib/admin/auth";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import { parseFeedbackAnalysisForm } from "@/lib/user-testing/feedback";

export async function updateFeedbackAnalysis(formData: FormData) {
  await requireFounder();

  const parsed = parseFeedbackAnalysisForm(formData);
  if ("error" in parsed) {
    return;
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

  await supabase
    .from("user_testing_feedback")
    .update(parsed.data)
    .eq("id", parsed.id);

  revalidatePath("/admin/feedback");
}
