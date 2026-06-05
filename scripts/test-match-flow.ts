import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;

  const lines = readFileSync(path, "utf8").split("\n");

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed
      .slice(equalsIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const supabase = createClient(
  requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

async function main() {
  const runId = Date.now();
  const password = `TestPassword-${randomUUID()}!`;

  const userAEmail = `test-a-${runId}@intentionally.local`;
  const userBEmail = `test-b-${runId}@intentionally.local`;

  let userAId: string | undefined;
  let userBId: string | undefined;

  try {
    console.log("Creating test users...");

    const { data: userA, error: userAError } =
      await supabase.auth.admin.createUser({
        email: userAEmail,
        password,
        email_confirm: true,
      });

    if (userAError || !userA.user) {
      throw new Error(`Failed to create User A: ${userAError?.message}`);
    }

    const { data: userB, error: userBError } =
      await supabase.auth.admin.createUser({
        email: userBEmail,
        password,
        email_confirm: true,
      });

    if (userBError || !userB.user) {
      throw new Error(`Failed to create User B: ${userBError?.message}`);
    }

    userAId = userA.user.id;
    userBId = userB.user.id;

    console.log("Updating test profiles...");

    const { error: profileAError } = await supabase
      .from("profiles")
      .update({
        display_name: "Test Alex",
        date_of_birth: "1997-01-01",
        gender: "man",
        seeking: ["woman"],
        intention: "long-term",
        bio_prompt_key: "best-sunday",
        bio_answer: "Coffee, a walk, and a proper conversation.",
        photos: ["test/alex-1.jpg", "test/alex-2.jpg"],
        neighbourhood: "London",
        availability: [66, 67, 68, 69],
        id_verified: true,
        id_verified_at: new Date().toISOString(),
        paused: false,
      })
      .eq("id", userAId);

    if (profileAError) {
      throw new Error(`Failed to update User A profile: ${profileAError.message}`);
    }

    const { error: profileBError } = await supabase
      .from("profiles")
      .update({
        display_name: "Test Maya",
        date_of_birth: "1998-01-01",
        gender: "woman",
        seeking: ["man"],
        intention: "long-term",
        bio_prompt_key: "best-sunday",
        bio_answer: "A gallery, good food, and no rushed replies.",
        photos: ["test/maya-1.jpg", "test/maya-2.jpg"],
        neighbourhood: "London",
        availability: [66, 67, 68, 69],
        id_verified: true,
        id_verified_at: new Date().toISOString(),
        paused: false,
      })
      .eq("id", userBId);

    if (profileBError) {
      throw new Error(`Failed to update User B profile: ${profileBError.message}`);
    }

    console.log("Creating reciprocal likes...");

    const { error: swipeAError } = await supabase.from("swipes").insert({
      swiper_id: userAId,
      swipee_id: userBId,
      direction: "like",
    });

    if (swipeAError) {
      throw new Error(`Failed to insert User A like: ${swipeAError.message}`);
    }

    const { error: swipeBError } = await supabase.from("swipes").insert({
      swiper_id: userBId,
      swipee_id: userAId,
      direction: "like",
    });

    if (swipeBError) {
      throw new Error(`Failed to insert User B like: ${swipeBError.message}`);
    }

    const userAFirst = userAId < userBId;
    const user_a = userAFirst ? userAId : userBId;
    const user_b = userAFirst ? userBId : userAId;

    console.log("Checking match was created...");

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, user_a, user_b, status")
      .eq("user_a", user_a)
      .eq("user_b", user_b)
      .maybeSingle();

    if (matchError) {
      throw new Error(`Failed to check match: ${matchError.message}`);
    }

    if (!match) {
      throw new Error("No match was created after reciprocal likes.");
    }

    if (match.status !== "pending_qa") {
      throw new Error(`Expected match status pending_qa, got ${match.status}`);
    }

    console.log("Product-flow test passed:");
    console.log(`- User A liked User B`);
    console.log(`- User B liked User A`);
    console.log(`- Match created with status: ${match.status}`);
    console.log(`- Match ID: ${match.id}`);
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
  console.error("Product-flow test failed:");
  console.error(error);
  process.exit(1);
});
