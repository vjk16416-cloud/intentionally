"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type LoginActionState = {
  phone?: string;
  error?: string;
};

const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

export async function requestOtp(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (!E164_PATTERN.test(phone)) {
    return {
      error: "Enter your phone number in E.164 format, e.g. +447700900123.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) {
    return { phone, error: error.message };
  }

  return { phone };
}

export async function verifyOtp(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const phone = String(formData.get("phone") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  if (!phone || !token) {
    return { phone, error: "Phone and code are both required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });
  if (error) {
    return { phone, error: error.message };
  }

  redirect("/discover");
}
