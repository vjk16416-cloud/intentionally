import "server-only";

import { Resend } from "resend";

function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const RESEND_API_KEY = ensure(
  "RESEND_API_KEY",
  process.env.RESEND_API_KEY,
);

export const resend = new Resend(RESEND_API_KEY);

// resend.dev sender works in test mode without DNS verification —
// but emails ONLY deliver to the address you signed up to Resend
// with (per Q6 of the Step 5 plan). Switch this to a verified
// intentionally.app sender before real-user beta.
export const FROM_EMAIL = "Intentionally <onboarding@resend.dev>";
