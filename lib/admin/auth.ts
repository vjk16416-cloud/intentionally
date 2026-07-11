import { createHash } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

const LOCAL_FOUNDER_DEV_COOKIE = "intentionally_local_founder_dev";

type RequireFounderOptions = {
  allowLocalDevBypass?: boolean;
};

function founderEmails() {
  return (process.env.FOUNDER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function localFounderDevCookieValue(email: string) {
  return createHash("sha256")
    .update(`intentionally-local-founder-dev:${email}`)
    .digest("hex");
}

async function hasLocalFounderDevBypass(allowedEmails: string[]) {
  if (process.env.NODE_ENV === "production" || allowedEmails.length === 0) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCAL_FOUNDER_DEV_COOKIE)?.value;
  if (!cookieValue) return false;

  return allowedEmails.some(
    (email) => cookieValue === localFounderDevCookieValue(email),
  );
}

export async function requireFounder(options: RequireFounderOptions = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allowedEmails = founderEmails();

  if (!user) {
    if (
      options.allowLocalDevBypass &&
      (await hasLocalFounderDevBypass(allowedEmails))
    ) {
      return null;
    }

    redirect("/login");
  }

  const email = user.email?.toLowerCase();

  if (!email || !allowedEmails.includes(email)) {
    redirect("/discover");
  }

  return user;
}
