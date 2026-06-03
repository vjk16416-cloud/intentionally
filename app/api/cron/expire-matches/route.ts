import "server-only";

import { createClient as createServiceRoleClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { authoriseCron } from "@/lib/cron/auth";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";

export const runtime = "nodejs";

// Closes pending_qa matches whose expires_at has passed. Scheduled
// every 15 minutes via vercel.json. Idempotent — the WHERE clause
// only touches rows still in pending_qa, so a re-fire over the same
// row is a no-op.

function admin() {
  return createServiceRoleClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

export async function GET(request: Request) {
  if (!authoriseCron(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = admin();
  const { error, count } = await supabase
    .from("matches")
    .update(
      { status: "closed", closed_reason: "expired" },
      { count: "exact" },
    )
    .eq("status", "pending_qa")
    .lt("expires_at", new Date().toISOString());

  if (error) {
    console.error("[cron/expire-matches] update failed", error);
    return new NextResponse("Database error", { status: 500 });
  }

  return NextResponse.json({ expired: count ?? 0 });
}
