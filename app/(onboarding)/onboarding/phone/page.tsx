import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { PhoneForm } from "./phone-form";

// Conditional onboarding step — only fires for email-auth users
// whose auth.users.phone is null. No "Step X of N" chip per Option
// (ii) of the plan: phone collection is identity data, not part of
// the linear profile-building flow (same convention as /verify).

export default async function PhoneStepPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Defensive bounce: if the gate didn't catch it, a user with a
  // confirmed phone shouldn't land here.
  if (user.phone) {
    redirect("/onboarding/profile");
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify your phone number
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          We use your phone number to help keep Intentionally safer and reduce
          fake profiles. Your number is not shown on your profile.
        </p>
      </header>
      <PhoneForm />
    </div>
  );
}
