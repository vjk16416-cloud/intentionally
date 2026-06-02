// Next.js inlines `process.env.NEXT_PUBLIC_*` at build time, but only
// when the expression is a literal property access — dynamic access
// like `process.env[name]` is opaque to the bundler and resolves to
// `undefined` in the client bundle even when the var is set. So we
// read each public var as a literal here, then validate.

function ensure(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const SUPABASE_URL = ensure(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

// Supabase deprecated anon/service_role naming in favour of
// sb_publishable_... / sb_secret_... but we keep the legacy env-var
// names so @supabase/ssr picks them up unchanged.
export const SUPABASE_PUBLISHABLE_KEY = ensure(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function getServiceRoleKey(): string {
  return ensure(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
