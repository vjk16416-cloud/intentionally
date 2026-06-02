import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on every request except static assets and image optimisation —
  // and except /api/webhooks/*, which is called by third-party services
  // (Stripe, etc.) that don't carry a Supabase session cookie and rely
  // on the raw request body for signature verification. Letting the
  // session-refresh middleware touch those requests is at best wasteful
  // and at worst risks interfering with body handling.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
