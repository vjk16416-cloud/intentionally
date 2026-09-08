import "server-only";

import { verifyGitHubSchedulerOidcToken } from "@/lib/cron/github-oidc";

// Shared authorization for /api/cron/* routes.
//
// Vercel Cron continues to authenticate with CRON_SECRET. The external
// 15-minute Q&A scheduler authenticates with a short-lived GitHub Actions
// OIDC token that is restricted to this repository, main branch and exact
// workflow. This avoids requiring GitHub and Vercel to store matching
// long-lived CRON_SECRET values.

function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const CRON_SECRET = ensure("CRON_SECRET", process.env.CRON_SECRET);
const QA_REMINDER_PATH = "/api/cron/qa-reminders";

export async function authoriseCron(request: Request): Promise<boolean> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;

  if (header === `Bearer ${CRON_SECRET}`) {
    return true;
  }

  // OIDC is intentionally accepted only for the Q&A reminder route.
  // Other cron routes retain CRON_SECRET-only authentication.
  if (new URL(request.url).pathname !== QA_REMINDER_PATH) {
    return false;
  }

  const oidcToken = header.slice("Bearer ".length);
  return verifyGitHubSchedulerOidcToken(oidcToken);
}
