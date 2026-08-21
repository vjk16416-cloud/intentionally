"use server";

import { createHash } from "node:crypto";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getSafeNextPathValue,
  resolvePostAuthNextPath,
} from "@/lib/auth/callback";
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
const LOCAL_FOUNDER_DEV_COOKIE = "intentionally_local_founder_dev";
const LOCAL_FOUNDER_DEV_COOKIE_MAX_AGE = 60 * 60 * 8;

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
    process.env.APP_URL ??
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

function isLocalOrigin(origin: string) {
  try {
    const url = new URL(origin);
    return (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1"
    );
  } catch {
    return false;
  }
}

function isLocalHost(host: string | null) {
  if (!host) return false;

  try {
    const url = new URL(`http://${host}`);
    const hostname = url.hostname.replace(/^\[|\]$/g, "");
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

function getAppOrigin(headersOrigin: string | null) {
  const requestOrigin = headersOrigin ? withoutTrailingSlash(headersOrigin) : null;
  const configuredOrigin = configuredAppOrigin();

  // Local development should always return to the local app that initiated auth.
  if (requestOrigin && isLocalOrigin(requestOrigin)) {
    return requestOrigin;
  }

  // If a deployed request arrives while the configured app URL is still local
  // (a common staging misconfiguration), never send the auth callback to localhost.
  if (
    requestOrigin &&
    (!configuredOrigin || isLocalOrigin(configuredOrigin))
  ) {
    return requestOrigin;
  }

  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (process.env.VERCEL_URL) {
    return `https://${withoutTrailingSlash(process.env.VERCEL_URL)}`;
  }

  return requestOrigin ?? LOCAL_APP_ORIGIN;
}

function getEmailRedirectTo(origin: string, next: string | null) {
  const redirectUrl = new URL("/auth/callback", origin);
  redirectUrl.searchParams.set("next", getSafeNextPathValue(next));
  return redirectUrl.toString();
}

function founderEmails() {
  return (process.env.FOUNDER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function localFounderDevCookieValue(email: string) {
  return createHash("sha256")
    .update(`intentionally-local-founder-dev:${email}`)
    .digest("hex");
}

export async function continueAsLocalFounder() {
  const headersList = await headers();

  if (
    process.env.NODE_ENV === "production" ||
    !isLocalHost(headersList.get("host"))
  ) {
    redirect("/login?error=local_founder_dev_disabled");
  }

  const [founderEmail] = founderEmails();
  if (!founderEmail) {
    redirect("/login?error=local_founder_email_missing");
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCAL_FOUNDER_DEV_COOKIE, localFounderDevCookieValue(founderEmail), {
    httpOnly: true,
    maxAge: LOCAL_FOUNDER_DEV_COOKIE_MAX_AGE,
    path: "/founder",
    sameSite: "lax",
    secure: false,
  });

  redirect("/founder");
}

export async function requestOtp(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const kind = detectKind(identifier);
  const next = String(formData.get("next") ?? "").trim();

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
            emailRedirectTo: getEmailRedirectTo(origin, next),
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
  const next = String(formData.get("next") ?? "").trim();

  if (kindRaw !== "email" && kindRaw !== "phone") {
    return { identifier, error: "Choose email or phone to sign in." };
  }

  if (!identifier || !token) {
    return {
      identifier,
      kind: kindRaw,
      error:
        kindRaw === "email"
          ? "Email address and code are both required."
          : "Phone number and code are both required.",
    };
  }

  const supabase = await createClient();

  const { error } =
    kindRaw === "email"
      ? await supabase.auth.verifyOtp({
          email: identifier,
          token,
          type: "email",
        })
      : await supabase.auth.verifyOtp({
          phone: identifier,
          token,
          type: "sms",
        });

  if (error) {
    return { identifier, kind: kindRaw, error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=auth_callback");
  }

  const onboarding = await getOnboardingState(supabase, user);

  if (kindRaw === "email") {
    redirect(
      resolvePostAuthNextPath({
        next,
        onboardingComplete: onboarding.status === "complete",
      }),
    );
  }

  redirect(onboarding.status === "complete" ? "/discover" : "/onboarding");
}
