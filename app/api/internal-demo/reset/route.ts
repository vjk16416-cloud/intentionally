import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { resetInternalDemoJourney } from "@/lib/internal-demo/reset";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function admin() {
  return createServiceRoleClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
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

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "You must be logged in to reset demo profiles." },
        { status: 401 },
      );
    }

    console.log(`[demo-reset] current user id: ${user.id}`);

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
  } catch (error) {
    console.error("[demo-reset] reset API failed", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Reset failed. Try again.",
      },
      { status: 500 },
    );
  }
}
