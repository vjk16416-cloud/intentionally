import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(url: URL) {
  const fallbackPath = "/discover";
  const next = url.searchParams.get("next");

  if (
    !next?.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return fallbackPath;
  }

  const target = new URL(next, url.origin);
  if (target.origin !== url.origin) {
    return fallbackPath;
  }

  return `${target.pathname}${target.search}${target.hash}`;
}

function logAuthCallbackFailure(reason: string, error?: unknown) {
  if (error instanceof Error) {
    console.warn("Auth callback failed", {
      reason,
      errorName: error.name,
      errorMessage: error.message,
    });
    return;
  }

  console.warn("Auth callback failed", { reason });
}

// Exchanges an OAuth/magic-link code for a session and redirects on.
// Phone OTP doesn't hit this route (it verifies inline) but the route
// is here so we have one path for any code-based auth we add later.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = getSafeNextPath(url);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }

    logAuthCallbackFailure("code_exchange_failed", error);
  } else {
    logAuthCallbackFailure("missing_code");
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback", url.origin));
}
