"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type PhoneActionState = {
  phone?: string;
  error?: string;
};

const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

export async function requestPhoneOtp(
  _prev: PhoneActionState,
  formData: FormData,
): Promise<PhoneActionState> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (!E164_PATTERN.test(phone)) {
    return {
      error: "Enter a valid phone number. Choose your country code and type your mobile number.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // updateUser({ phone }) sends an OTP via Twilio. The actual phone
  // on auth.users.phone isn't set until verifyOtp with type
  // "phone_change" confirms it, so the onboarding gate (which reads
  // user.phone) still routes the user here until they finish.
  const { error } = await supabase.auth.updateUser({ phone });
  if (error) {
    return { phone, error: error.message };
  }

  return { phone };
}

export async function verifyPhoneOtp(
  _prev: PhoneActionState,
  formData: FormData,
): Promise<PhoneActionState> {
  const phone = String(formData.get("phone") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();
  if (!phone || !token) {
    return { phone, error: "Phone and code are both required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "phone_change",
  });
  if (error) {
    return { phone, error: error.message };
  }

  redirect("/onboarding/profile");
}
