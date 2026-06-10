import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

function getSafeNextPath(url: URL) {
  const next = url.searchParams.get("next");
  if (!next?.startsWith("/") || next.startsWith("//")) {
    return "/onboarding";
  }

  return next;
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
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback", url.origin));
}
