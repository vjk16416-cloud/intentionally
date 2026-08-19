import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

const VERIFICATION_TOKEN = "Kyu12yoCXJsV2YRaWFUQ1S0nsRgzFyR8ne9oKqdyUjQ";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("token") !== VERIFICATION_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const email = (process.env.FOUNDER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim())
    .find(Boolean);

  if (!email) {
    return NextResponse.json(
      { error: "Founder verification email is not configured." },
      { status: 500 },
    );
  }

  const supabase = await createClient();
  const redirectUrl = new URL("/auth/callback", request.nextUrl.origin);
  redirectUrl.searchParams.set("next", "/discover");

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectUrl.toString() },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
