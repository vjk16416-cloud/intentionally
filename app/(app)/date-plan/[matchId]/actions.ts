"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isDatePlanKey, type DatePlanKey } from "@/lib/date-plans/options";
import { trackServerAnalyticsEvent } from "@/lib/analytics/server";
import { createClient } from "@/lib/supabase/server";

export type ShareDatePlanState = {
  error?: string;
  sharedPlanKey?: DatePlanKey;
};

type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
};

export async function shareDatePlan(
  _prev: ShareDatePlanState,
  formData: FormData,
): Promise<ShareDatePlanState> {
  const matchId = String(formData.get("matchId") ?? "");
  const planKey = String(formData.get("planKey") ?? "");

  if (!matchId || !isDatePlanKey(planKey)) {
    return { error: "Choose a date plan and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a, user_b")
    .eq("id", matchId)
    .maybeSingle<MatchRow>();

  if (!match || (match.user_a !== user.id && match.user_b !== user.id)) {
    redirect("/discover");
  }

  const { data: chat } = await supabase
    .from("chats")
    .select("id")
    .eq("match_id", matchId)
    .maybeSingle<{ id: string }>();

  if (!chat) {
    redirect("/discover");
  }

  const { data: existingPreference } = await supabase
    .from("date_plan_preferences")
    .select("id")
    .eq("match_id", matchId)
    .eq("user_id", user.id)
    .maybeSingle<{ id: string }>();

  const { error } = await supabase.from("date_plan_preferences").upsert(
    {
      match_id: matchId,
      user_id: user.id,
      plan_key: planKey,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "match_id,user_id" },
  );

  if (error) {
    return { error: "We could not share that plan. Try again." };
  }

  if (!existingPreference) {
    await trackServerAnalyticsEvent("datePlanCreated", {
      distinctId: user.id,
      properties: { match_id: matchId, chat_id: chat.id },
    });
  }

  revalidatePath(`/date-plan/${matchId}`);
  return { sharedPlanKey: planKey };
}
