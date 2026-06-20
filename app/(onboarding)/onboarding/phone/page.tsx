import { redirect } from "next/navigation";

import { StepShell } from "@/components/onboarding/step-shell";
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
    <StepShell
      stepLabel="Safety check"
      title="Verify your phone number"
      description="We use your phone number to help keep Intentionally safer. It is not shown on your profile."
      className="mx-auto w-full max-w-md"
    >
      <PhoneForm />
    </StepShell>
  );
}
