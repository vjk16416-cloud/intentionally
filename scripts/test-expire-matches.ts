import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!serviceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function uniqueEmail(label: string) {
  return `ci-expiry-${label}-${Date.now()}@example.com`;
}

async function createTestUser(label: string) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: uniqueEmail(label),
    password: "TestPassword123!",
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`Failed to create ${label}: ${error?.message}`);
  }

  return data.user.id;
}

async function main() {
  let userAId: string | null = null;
  let userBId: string | null = null;

  try {
    console.log("Creating test users...");

    userAId = await createTestUser("a");
    userBId = await createTestUser("b");

    const userAFirst = userAId < userBId;
    const user_a = userAFirst ? userAId : userBId;
    const user_b = userAFirst ? userBId : userAId;

    console.log("Creating expired pending match...");

    const expiredAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: match, error: matchCreateError } = await supabase
      .from("matches")
      .insert({
        user_a,
        user_b,
        status: "pending_qa",
        expires_at: expiredAt,
      })
      .select("id, status, closed_reason, expires_at")
      .single();

    if (matchCreateError || !match) {
      throw new Error(
        `Failed to create expired match: ${matchCreateError?.message}`,
      );
    }

    console.log("Running expiry update...");

    const { error: expiryError, count } = await supabase
      .from("matches")
      .update(
        { status: "closed", closed_reason: "expired" },
        { count: "exact" },
      )
      .eq("status", "pending_qa")
      .lt("expires_at", new Date().toISOString());

    if (expiryError) {
      throw new Error(`Failed to expire matches: ${expiryError.message}`);
    }

    if ((count ?? 0) < 1) {
      throw new Error("Expected at least one expired match to be updated.");
    }

    console.log("Checking match was closed...");

    const { data: updatedMatch, error: checkError } = await supabase
      .from("matches")
      .select("id, status, closed_reason")
      .eq("id", match.id)
      .single();

    if (checkError || !updatedMatch) {
      throw new Error(`Failed to check updated match: ${checkError?.message}`);
    }

    if (updatedMatch.status !== "closed") {
      throw new Error(`Expected status closed, got ${updatedMatch.status}`);
    }

    if (updatedMatch.closed_reason !== "expired") {
      throw new Error(
        `Expected closed_reason expired, got ${updatedMatch.closed_reason}`,
      );
    }

    console.log("Expiry-flow test passed:");
    console.log("- Expired pending match was created");
    console.log("- Expiry update ran successfully");
    console.log(`- Match moved to status: ${updatedMatch.status}`);
    console.log(`- Closed reason: ${updatedMatch.closed_reason}`);
    console.log(`- Match ID: ${updatedMatch.id}`);
  } finally {
    console.log("Cleaning up test users...");

    if (userAId) {
      await supabase.auth.admin.deleteUser(userAId);
    }

    if (userBId) {
      await supabase.auth.admin.deleteUser(userBId);
    }
  }
}

main().catch((error) => {
  console.error("Expiry-flow test failed:");
  console.error(error);
  process.exit(1);
});
