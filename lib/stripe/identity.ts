import "server-only";

import { stripe } from "./client";

// UK identity documents we accept. id_card is omitted because the UK
// doesn't issue a general-purpose national ID card; restricting the
// dropdown keeps the verification UI from offering something Stripe
// would just reject.
const ALLOWED_DOCUMENT_TYPES = ["driving_license", "passport"] as const;

export type CreateVerificationSessionResult = {
  url: string;
  sessionId: string;
};

// Creates a Stripe Identity verification session for the given user
// and returns the hosted URL the browser should redirect to. The
// user_id is stashed in metadata so the webhook can route the
// verification result back to the right profile.
export async function createIdentityVerificationSession(
  userId: string,
  returnUrl: string,
): Promise<CreateVerificationSessionResult> {
  const session = await stripe.identity.verificationSessions.create({
    type: "document",
    metadata: { user_id: userId },
    return_url: returnUrl,
    options: {
      document: {
        allowed_types: [...ALLOWED_DOCUMENT_TYPES],
        require_live_capture: true,
        require_matching_selfie: true,
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a verification session URL.");
  }

  return { url: session.url, sessionId: session.id };
}
