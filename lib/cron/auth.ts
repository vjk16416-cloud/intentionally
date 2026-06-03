import "server-only";

// Shared Bearer-token check for /api/cron/* routes. Vercel Cron sends
// `Authorization: Bearer <CRON_SECRET>` automatically when the project
// has CRON_SECRET set as an env var; the route reads the same var.
// Local-dev curl invocations must pass the same header manually.

function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const CRON_SECRET = ensure("CRON_SECRET", process.env.CRON_SECRET);

export function authoriseCron(request: Request): boolean {
  const header = request.headers.get("authorization");
  if (!header) return false;
  // Constant-time compare would be nicer; for the values we're
  // checking here (a server-side secret), simple equality is fine.
  return header === `Bearer ${CRON_SECRET}`;
}
