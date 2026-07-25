"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { trackServerAnalyticsEvent } from "@/lib/analytics/server";

export async function sendMessage(formData: FormData) {
  const chatId = String(formData.get("chatId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!chatId || !body) {
    redirect("/discover");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: chat } = await supabase
    .from("chats")
    .select("match_id")
    .eq("id", chatId)
    .maybeSingle<{ match_id: string }>();

  const { count: existingMessageCount } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("chat_id", chatId);

  const { data: message } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      body,
    })
    .select("id")
    .single();

  if (message && existingMessageCount === 0 && chat) {
    await trackServerAnalyticsEvent("firstMessage", {
      distinctId: user.id,
      properties: { match_id: chat.match_id, chat_id: chatId },
    });
  }

  redirect(`/chat/${chatId}`);
}
