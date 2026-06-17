"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type LoginIdentifierKind = "email" | "phone";

export type LoginActionState = {
  identifier?: string;
  kind?: LoginIdentifierKind;
  error?: string;
  sent?: boolean;
};

const E164_PATTERN = /^\+[1-9]\d{6,14}$/;
const LOCAL_APP_ORIGIN = "http://localhost:3000";
const EMAIL_SIGN_IN_NEXT_PATH = "/discover";

function detectKind(value: string): LoginIdentifierKind | null {
  if (value.includes("@")) return "email";
  if (E164_PATTERN.test(value)) return "phone";
  return null;
}

function withoutTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getProductionAppOrigin(headersOrigin: string | null) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return withoutTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return withoutTrailingSlash(process.env.NEXT_PUBLIC_APP_URL);
  }

  if (process.env.VERCEL_URL) {
    return `https://${withoutTrailingSlash(process.env.VERCEL_URL)}`;
  }

  return headersOrigin ? withoutTrailingSlash(headersOrigin) : LOCAL_APP_ORIGIN;
}

function getAppOrigin(headersOrigin: string | null) {
  if (process.env.NODE_ENV !== "production") {
    return LOCAL_APP_ORIGIN;
  }

  return getProductionAppOrigin(headersOrigin);
}

export async function requestOtp(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const kind = detectKind(identifier);

  if (!kind) {
    return {
      error:
        "Enter your email address or phone number in E.164 format, for example +447700900123.",
    };
  }

  const supabase = await createClient();

  const headersList = await headers();
  const origin = getAppOrigin(headersList.get("origin"));

  const { error } =
    kind === "email"
      ? await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${EMAIL_SIGN_IN_NEXT_PATH}`,
          },
        })
      : await supabase.auth.signInWithOtp({ phone: identifier });

  if (error) {
    return { identifier, kind, error: error.message };
  }

  return { identifier, kind, sent: true };
}

export async function verifyOtp(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "");
  const token = String(formData.get("token") ?? "").trim();

  if (kindRaw !== "phone") {
    return { identifier, error: "Email sign-in now uses a secure email link." };
  }

  if (!identifier || !token) {
    return {
      identifier,
      kind: "phone",
      error: "Phone number and code are both required.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    phone: identifier,
    token,
    type: "sms",
  });

  if (error) {
    return { identifier, kind: "phone", error: error.message };
  }

  redirect("/discover");
}
