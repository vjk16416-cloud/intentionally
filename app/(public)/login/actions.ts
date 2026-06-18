"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getOnboardingState } from "@/lib/onboarding/state";
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

function configuredAppOrigin() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredUrl) {
    return null;
  }

  try {
    const url = new URL(configuredUrl);
    return withoutTrailingSlash(url.origin);
  } catch {
    console.warn("Ignoring invalid configured app URL for email auth redirect.");
    return null;
  }
}

function getAppOrigin(headersOrigin: string | null) {
  const configuredOrigin = configuredAppOrigin();
  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (process.env.VERCEL_URL) {
    return `https://${withoutTrailingSlash(process.env.VERCEL_URL)}`;
  }

  return headersOrigin ? withoutTrailingSlash(headersOrigin) : LOCAL_APP_ORIGIN;
}

function getEmailRedirectTo(origin: string) {
  const redirectUrl = new URL("/auth/callback", origin);
  redirectUrl.searchParams.set("next", EMAIL_SIGN_IN_NEXT_PATH);
  return redirectUrl.toString();
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
            emailRedirectTo: getEmailRedirectTo(origin),
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth_callback");
  }

  const onboarding = await getOnboardingState(supabase, user);
  redirect(onboarding.status === "complete" ? "/discover" : "/onboarding");
}
