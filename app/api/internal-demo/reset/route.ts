import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { resetInternalDemoJourney } from "@/lib/internal-demo/reset";

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function admin() {
  return createServiceRoleClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );
}

async function userClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
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
            // The reset route only needs to read the current session.
          }
        },
      },
    },
  );
}

function resetAllowed() {
  return process.env.NODE_ENV !== "production";
}

export async function POST() {
  if (!resetAllowed()) {
    return NextResponse.json(
      { ok: false, error: "Internal demo reset is disabled in production." },
      { status: 403 },
    );
  }

  try {
    console.log("[demo-reset] reset API called");

    const supabase = await userClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "You must be logged in to reset demo profiles." },
        { status: 401 },
      );
    }

    const result = await resetInternalDemoJourney(admin(), user.id);

    console.log(`[demo-reset] demo profiles found: ${result.demoProfilesFound}`);
    console.log(`[demo-reset] swipes deleted: ${result.swipesDeleted}`);
    console.log(
      `[demo-reset] reciprocal demo swipes deleted: ${result.reciprocalSwipesDeleted}`,
    );
    console.log(`[demo-reset] matches deleted: ${result.matchesDeleted}`);
    revalidatePath("/discover");
    console.log("[demo-reset] revalidatePath('/discover') completed");
    console.log("[demo-reset] reset complete");

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch {
    console.error("[demo-reset] reset API failed");
    return NextResponse.json(
      {
        ok: false,
        error: "Reset failed. Try again.",
      },
      { status: 500 },
    );
  }
}
