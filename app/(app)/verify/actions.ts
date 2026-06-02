"use server";

import { redirect } from "next/navigation";

import { createIdentityVerificationSession } from "@/lib/stripe/identity";
import { createClient } from "@/lib/supabase/server";

function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const APP_URL = ensure("APP_URL", process.env.APP_URL);

export type StartVerificationState = {
  error?: string;
};

// Sanitise the post-verification return path. Must be a relative path
// on our own app — never an absolute URL or protocol-relative URL —
// otherwise a forged form post could turn this action into an open
// redirect to an attacker-controlled domain.
function sanitiseReturnPath(raw: string): string {
  if (!raw) return "/discover";
  if (!raw.startsWith("/")) return "/discover";
  if (raw.startsWith("//")) return "/discover";
  return raw;
}

export async function startVerification(
  _prev: StartVerificationState,
  formData: FormData,
): Promise<StartVerificationState> {
  const returnPath = sanitiseReturnPath(
    String(formData.get("returnTo") ?? ""),
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // TODO(posthog): capture `id_verification_started` here once
  // PostHog is wired in (deferred to its own commit before Step 4).

  let session;
  try {
    const returnUrl = `${APP_URL}/verify/return?return=${encodeURIComponent(returnPath)}`;
    session = await createIdentityVerificationSession(user.id, returnUrl);
  } catch (err) {
    console.error("[verify] failed to create session", err);
    return {
      error:
        "We couldn't start verification. Try again in a moment, and if it keeps failing, contact support.",
    };
  }

  redirect(session.url);
}
