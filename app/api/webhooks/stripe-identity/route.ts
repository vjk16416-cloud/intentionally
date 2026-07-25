import "server-only";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { stripe } from "@/lib/stripe/client";
import { trackServerAnalyticsEvent } from "@/lib/analytics/server";
import { getServiceRoleKey, SUPABASE_URL } from "@/lib/supabase/env";

// Stripe SDK uses Node's crypto for signature verification, so this
// route must run on the Node runtime (Edge would not have the right
// crypto primitives).
export const runtime = "nodejs";

function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const STRIPE_IDENTITY_WEBHOOK_SECRET = ensure(
  "STRIPE_IDENTITY_WEBHOOK_SECRET",
  process.env.STRIPE_IDENTITY_WEBHOOK_SECRET,
);

// Service-role Supabase client — webhook requests have no user
// session, and we need to bypass RLS to update the user's profile.
function serviceRoleClient() {
  return createClient(SUPABASE_URL, getServiceRoleKey(), {
    auth: { persistSession: false },
  });
}

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  // Signature verification needs the unmodified raw body.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      STRIPE_IDENTITY_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[stripe-identity] signature verification failed", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Only `verified` mutates state. requires_input and canceled are
  // logged for observability; other event types are acked silently
  // so Stripe doesn't retry them.
  if (event.type === "identity.verification_session.verified") {
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const userId = session.metadata?.user_id;
    if (!userId) {
      console.error(
        "[stripe-identity] verified event missing metadata.user_id",
        session.id,
      );
      return new NextResponse("Missing user_id metadata", { status: 400 });
    }

    const supabase = serviceRoleClient();

    // Preserve the original id_verified_at if it exists — a
    // re-verification shouldn't reset the "first verified" time.
    const { data: existing } = await supabase
      .from("profiles")
      .select("id_verified_at")
      .eq("id", userId)
      .maybeSingle<{ id_verified_at: string | null }>();

    if (!existing) {
      console.error(
        "[stripe-identity] no profile row for verified user_id",
        userId,
      );
      // Ack so Stripe doesn't retry — a missing profile row won't
      // materialise on retry.
      return new NextResponse("ok", { status: 200 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        id_verified: true,
        id_verified_at: existing.id_verified_at ?? new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[stripe-identity] update failed", error);
      // 5xx so Stripe retries — could be a transient DB issue.
      return new NextResponse("Database update failed", { status: 500 });
    }

    await trackServerAnalyticsEvent("verificationCompleted", {
      distinctId: userId,
    });

    return new NextResponse("ok", { status: 200 });
  }

  if (
    event.type === "identity.verification_session.requires_input" ||
    event.type === "identity.verification_session.canceled"
  ) {
    const session = event.data.object as Stripe.Identity.VerificationSession;
    const userId = session.metadata?.user_id;
    if (userId) {
      await trackServerAnalyticsEvent("verificationFailed", {
        distinctId: userId,
        properties: { failure_area: "verification" },
      });
    }
    console.info(
      "[stripe-identity]",
      event.type,
      session.id,
      session.last_error,
    );
    return new NextResponse("ok", { status: 200 });
  }

  console.info("[stripe-identity] ignoring event type", event.type);
  return new NextResponse("ok", { status: 200 });
}
