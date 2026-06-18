import { NextResponse, type NextRequest } from "next/server";

import {
  getSafeNextPath,
  resolvePostAuthRedirectPath,
} from "@/lib/auth/callback";
import { getOnboardingState } from "@/lib/onboarding/state";
import { createClient } from "@/lib/supabase/server";

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

async function resolveRedirectPath(url: URL) {
  const code = url.searchParams.get("code");
  if (!code) {
    logAuthCallbackFailure("missing_code", {
      safeNext: getSafeNextPath(url),
    });
    return "/login?error=auth_callback";
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    logAuthCallbackFailure("code_exchange_failed", {
      hasCode: true,
      safeNext: getSafeNextPath(url),
      error,
    });
    return "/login?error=auth_callback";
  }

  if (!data.user) {
    logAuthCallbackFailure("missing_user_after_exchange", {
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
  const redirectPath = await resolveRedirectPath(url);

  return NextResponse.redirect(new URL(redirectPath, url.origin));
}
