"use server";

import { redirect } from "next/navigation";

import { parseChatMessageInput } from "@/lib/chat/validation";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(formData: FormData) {
  const input = parseChatMessageInput(
    formData.get("chatId"),
    formData.get("body"),
  );

  if (!input) {
    redirect("/discover");
  }

  const { chatId, body } = input;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: message } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      sender_id: user.id,
      body,
    })
    .select("id")
    .single();

  const sentParam = message?.id
    ? `?sent=${encodeURIComponent(String(message.id))}`
    : "";

  redirect(`/chat/${chatId}${sentParam}`);
}
