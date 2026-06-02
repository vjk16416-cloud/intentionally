import "server-only";

import Stripe from "stripe";

// Read STRIPE_SECRET_KEY via a literal expression — the same reason as
// in lib/supabase/env.ts. Dynamic process.env[name] access wouldn't
// matter here (this module is server-only) but the literal form is
// the project convention and keeps env handling consistent.
function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const STRIPE_SECRET_KEY = ensure(
  "STRIPE_SECRET_KEY",
  process.env.STRIPE_SECRET_KEY,
);

// Single shared Stripe client. apiVersion is intentionally NOT pinned
// for MVP — we use the account's default so we don't have to track
// Stripe's release cadence yet. Pin before the first real-user launch.
export const stripe = new Stripe(STRIPE_SECRET_KEY);
