import "server-only";

// Daily.co server-side config. The API key is server-only and is resolved
// only when a Daily API request is made, so importing a server component
// cannot accidentally make builds depend on the secret being present.

function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getDailyApiKey() {
  return ensure("DAILY_API_KEY", process.env.DAILY_API_KEY);
}

export const DAILY_API_URL = "https://api.daily.co/v1";
