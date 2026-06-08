import { redirect } from "next/navigation";

import { isDatePlanKey, type DatePlanKey } from "@/lib/date-plans/options";
import { createClient } from "@/lib/supabase/server";

import { DatePlanPicker } from "./date-plan-picker";

type MatchRow = {
  id: string;
  user_a: string;
  user_b: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

export default async function DatePlanPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
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

  const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", otherUserId)
    .maybeSingle<ProfileRow>();

  const { data: preference } = await supabase
    .from("date_plan_preferences")
    .select("plan_key")
    .eq("match_id", matchId)
    .eq("user_id", user.id)
    .maybeSingle<{ plan_key: string }>();

  const currentPlanKey: DatePlanKey | null =
    preference && isDatePlanKey(preference.plan_key)
      ? preference.plan_key
      : null;

  return (
    <DatePlanPicker
      matchId={matchId}
      chatId={chat.id}
      otherName={otherProfile?.display_name ?? "your match"}
      currentPlanKey={currentPlanKey}
    />
  );
}
