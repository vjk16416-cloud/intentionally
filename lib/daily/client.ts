import "server-only";

// Daily.co server-side config. The API key is server-only — never
// expose to the client bundle. Step 6's live Q&A embed will mint
// meeting tokens via this same key on the server.

function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const DAILY_API_KEY = ensure(
  "DAILY_API_KEY",
  process.env.DAILY_API_KEY,
);

export const DAILY_API_URL = "https://api.daily.co/v1";
