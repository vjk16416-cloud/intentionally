import assert from "node:assert/strict";

const ACTIVE_SUPABASE_URL = "https://opfbojqdwyfqannyvbua.supabase.co";
const ACTIVE_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_OuQPaz9nD-KAOHfM0RbMtw_mm46V1_2";

process.env.NEXT_PUBLIC_SUPABASE_URL =
  "https://mgtqithikswryuoqtwae.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "inactive-staging-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "server-only-placeholder";

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = await import(
  "../lib/supabase/env"
);

assert.equal(
  SUPABASE_URL,
  ACTIVE_SUPABASE_URL,
  "inactive staging URL must resolve to the active production Supabase project",
);
assert.equal(
  SUPABASE_PUBLISHABLE_KEY,
  ACTIVE_SUPABASE_PUBLISHABLE_KEY,
  "inactive staging public key must be replaced with the active production publishable key",
);

console.log("Production Supabase target regression passed.");
