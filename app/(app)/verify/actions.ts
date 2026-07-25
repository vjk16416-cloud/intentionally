"use server";

import { redirect } from "next/navigation";

import {
  createIdentityVerificationSession,
  getLatestIdentityVerificationSession,
} from "@/lib/stripe/identity";
import { trackServerAnalyticsEvent } from "@/lib/analytics/server";
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

  let session;
  try {
    const returnUrl = `${APP_URL}/verify/return?return=${encodeURIComponent(returnPath)}`;
    session = await createIdentityVerificationSession(user.id, returnUrl);
  } catch (err) {
    console.error("[verify] failed to create session", err);
    await trackServerAnalyticsEvent("verificationFailed", {
      distinctId: user.id,
      properties: { failure_area: "verification" },
    });
    return {
      error:
        "We couldn't start verification. Try again in a moment, and if it keeps failing, contact support.",
    };
  }

  await trackServerAnalyticsEvent("verificationStarted", {
    distinctId: user.id,
  });

  redirect(session.url);
}

export async function refreshVerification(formData: FormData): Promise<void> {
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

  try {
    const session = await getLatestIdentityVerificationSession(user.id);

    if (!session) {
      redirect(
        `/verify/return?return=${encodeURIComponent(returnPath)}&status=missing_session`,
      );
    }

    if (session.status === "verified") {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id_verified_at")
        .eq("id", user.id)
        .maybeSingle<{ id_verified_at: string | null }>();

      if (existing) {
        const { error } = await supabase
          .from("profiles")
          .update({
            id_verified: true,
            id_verified_at: existing.id_verified_at ?? new Date().toISOString(),
          })
          .eq("id", user.id);

        if (!error) {
          redirect(returnPath);
        }
      }

      redirect(
        `/verify/return?return=${encodeURIComponent(returnPath)}&status=processing`,
      );
    }

    redirect(
      `/verify/return?return=${encodeURIComponent(returnPath)}&status=${encodeURIComponent(session.status)}`,
    );
  } catch (error) {
    console.error("[verify] failed to refresh session", error);
    redirect(
      `/verify/return?return=${encodeURIComponent(returnPath)}&status=error`,
    );
  }
}
