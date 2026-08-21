import { NextResponse, type NextRequest } from "next/server";

import {
  getSafeNextPath,
  resolvePostAuthRedirectPath,
} from "@/lib/auth/callback";
import { getOnboardingState } from "@/lib/onboarding/state";
import {
  createClient,
  createRouteHandlerClient,
} from "@/lib/supabase/server";

const SUPPORTED_EMAIL_OTP_TYPES = new Set([
  "email",
  "magiclink",
  "signup",
  "invite",
]);

function logAuthCallbackFailure(
  reason: string,
  details?: Record<string, unknown>,
) {
  if (details?.error instanceof Error) {
    const { error, ...rest } = details;
    console.warn("Auth callback failed", {
      reason,
      ...rest,
      errorName: error.name,
      errorMessage: error.message,
    });
    return;
  }

  console.warn("Auth callback failed", { reason, ...details });
}

function getSupportedEmailOtpType(url: URL) {
  const type = url.searchParams.get("type");

  if (!type || !SUPPORTED_EMAIL_OTP_TYPES.has(type)) {
    return null;
  }

  return type as "email" | "magiclink" | "signup" | "invite";
}

async function resolveRedirectPath(
  url: URL,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  if (!code && !tokenHash) {
    logAuthCallbackFailure("missing_code", {
      safeNext: getSafeNextPath(url),
    });
    return "/login?error=auth_callback";
  }

  const emailOtpType = getSupportedEmailOtpType(url);
  if (tokenHash && !emailOtpType) {
    logAuthCallbackFailure("unsupported_token_hash_type", {
      hasTokenHash: true,
      safeNext: getSafeNextPath(url),
    });
    return "/login?error=auth_callback";
  }

  const { data, error } = tokenHash
    ? await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: emailOtpType ?? "email",
      })
    : await supabase.auth.exchangeCodeForSession(code ?? "");
  if (error) {
    logAuthCallbackFailure(
      tokenHash ? "token_hash_verification_failed" : "code_exchange_failed",
      {
        hasTokenHash: Boolean(tokenHash),
        hasCode: Boolean(code),
        safeNext: getSafeNextPath(url),
        error,
      },
    );
    return "/login?error=auth_callback";
  }

  if (!data.user) {
    logAuthCallbackFailure("missing_user_after_exchange", {
      hasTokenHash: Boolean(tokenHash),
      hasCode: Boolean(code),
      safeNext: getSafeNextPath(url),
    });
    return "/login?error=auth_callback";
  }

  const onboarding = await getOnboardingState(supabase, data.user);
  return resolvePostAuthRedirectPath({
    url,
    onboardingComplete: onboarding.status === "complete",
  });
}

// Exchanges an OAuth/magic-link code for a session and redirects on.
// Phone OTP doesn't hit this route (it verifies inline) but the route
// is here so we have one path for any code-based auth we add later.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { supabase, applyCookies } = await createRouteHandlerClient();
  const redirectPath = await resolveRedirectPath(url, supabase);

  // Use a relative Location header so the browser keeps the public hostname
  // that received the callback. Building an absolute URL from request.url can
  // use an internal/normalised host behind a proxy and strand the auth cookie
  // on a different hostname.
  const response = new NextResponse(null, {
    status: 307,
    headers: { Location: redirectPath },
  });

  return applyCookies(response);
}
