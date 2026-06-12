"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

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
