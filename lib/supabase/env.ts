// Next.js inlines `process.env.NEXT_PUBLIC_*` at build time, but only
// when the expression is a literal property access — dynamic access
// like `process.env[name]` is opaque to the bundler and resolves to
// `undefined` in the client bundle even when the var is set. So we
// read each public var as a literal here, then validate.

const ACTIVE_PRODUCTION_SUPABASE_URL =
  "https://opfbojqdwyfqannyvbua.supabase.co";
const ACTIVE_PRODUCTION_PUBLISHABLE_KEY =
  "sb_publishable_OuQPaz9nD-KAOHfM0RbMtw_mm46V1_2";
const INACTIVE_STAGING_HOST = "mgtqithikswryuoqtwae.supabase.co";

function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function pointsAtInactiveStaging(value: string): boolean {
  try {
    return new URL(value).hostname === INACTIVE_STAGING_HOST;
  } catch {
    return false;
  }
}

const configuredSupabaseUrl = ensure(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
const configuredPublishableKey = ensure(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
const replaceInactiveStaging = pointsAtInactiveStaging(configuredSupabaseUrl);

export const SUPABASE_URL = replaceInactiveStaging
  ? ACTIVE_PRODUCTION_SUPABASE_URL
  : configuredSupabaseUrl;

// Supabase deprecated anon/service_role naming in favour of
// sb_publishable_... / sb_secret_... but we keep the legacy env-var
// names so @supabase/ssr picks them up unchanged. If deployment config
// still carries the retired staging URL, replace both public values as a
// pair so production can never combine the active URL with a staging key.
export const SUPABASE_PUBLISHABLE_KEY = replaceInactiveStaging
  ? ACTIVE_PRODUCTION_PUBLISHABLE_KEY
  : configuredPublishableKey;

export function getServiceRoleKey(): string {
  return ensure(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
