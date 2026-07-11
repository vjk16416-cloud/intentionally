import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

type CookiesToSet = Parameters<NonNullable<CookieMethodsServer["setAll"]>>[0];

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // setAll throws inside server components — the middleware
          // refreshes the session, so it's safe to ignore here.
        }
      },
    },
  });
}

export async function createRouteHandlerClient() {
  const cookieStore = await cookies();
  const cookiesToSet: CookiesToSet = [];
  const headersToSet = new Headers();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(nextCookies, responseHeaders) {
        cookiesToSet.push(...nextCookies);
        for (const [key, value] of Object.entries(responseHeaders)) {
          headersToSet.set(key, value);
        }
      },
    },
  });

  return {
    supabase,
    applyCookies(response: NextResponse) {
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options);
      }

      headersToSet.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    },
  };
}
