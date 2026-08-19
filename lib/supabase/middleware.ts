import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getLoginPath } from "@/lib/auth/callback";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

const PROTECTED_APP_ROUTE_PREFIXES = [
  "/discover",
  "/vibe-checks",
  "/schedule",
  "/qa",
  "/chat",
  "/date-plan",
  "/verify",
] as const;

function isProtectedAppPath(pathname: string) {
  return PROTECTED_APP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, responseHeaders) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [key, value] of Object.entries(responseHeaders)) {
          response.headers.set(key, value);
        }
      },
    },
  });

  // Touch the session so the cookie is refreshed if needed, and use the same
  // verified user result to preserve a protected destination for logged-out
  // browser navigation. Server-action POSTs keep their existing handling so
  // we never replay a POST body through a redirect to /login.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    (request.method === "GET" || request.method === "HEAD") &&
    isProtectedAppPath(request.nextUrl.pathname)
  ) {
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    const loginUrl = new URL(getLoginPath(requestedPath), request.url);
    const redirectResponse = NextResponse.redirect(loginUrl);

    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }

    return redirectResponse;
  }

  return response;
}
