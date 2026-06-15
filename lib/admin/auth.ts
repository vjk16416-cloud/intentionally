import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function founderEmails() {
  return (process.env.FOUNDER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireFounder() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const allowedEmails = founderEmails();
  const email = user.email?.toLowerCase();

  if (!email || !allowedEmails.includes(email)) {
    redirect("/discover");
  }

  return user;
}
