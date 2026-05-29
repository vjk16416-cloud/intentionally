function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const SUPABASE_URL = required("NEXT_PUBLIC_SUPABASE_URL");

// Supabase deprecated anon/service_role naming in favour of
// sb_publishable_... / sb_secret_... but we keep the legacy env-var
// names so @supabase/ssr picks them up unchanged.
export const SUPABASE_PUBLISHABLE_KEY = required(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
);

export function getServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}
