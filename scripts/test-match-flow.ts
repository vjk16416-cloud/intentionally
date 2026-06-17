import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

import {
  getInternalDemoOrdinal,
  INTERNAL_DEMO_PROFILE_NAMES,
  isInternalDemoProfile,
  shouldAutoMatchInternalDemoProfile,
} from "../lib/internal-demo/profiles";
import { resetInternalDemoJourney } from "../lib/internal-demo/reset";

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

type DemoProfileRow = {
  id: string;
  display_name: string | null;
  created_at: string;
};

function matchPair(userId: string, profileId: string) {
  return {
    user_a: userId < profileId ? userId : profileId,
    user_b: userId < profileId ? profileId : userId,
  };
}

async function findMatch(userId: string, profileId: string) {
  const { user_a, user_b } = matchPair(userId, profileId);
  const { data, error } = await supabase
    .from("matches")
    .select("id")
    .eq("user_a", user_a)
    .eq("user_b", user_b)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(`Failed to check demo match: ${error.message}`);
  }

  return data;
}

async function insertLike(swiperId: string, swipeeId: string) {
  const { error } = await supabase.from("swipes").insert({
    swiper_id: swiperId,
    swipee_id: swipeeId,
    direction: "like",
  });

  if (error && error.code !== "23505") {
    throw new Error(`Failed to insert demo like: ${error.message}`);
  }
}

async function verifyInternalDemoAlternatingMatches(userId: string) {
  console.log("Checking internal demo alternating matches...");

  const { data: demoProfiles, error } = await supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .in("display_name", Array.from(INTERNAL_DEMO_PROFILE_NAMES))
    .order("created_at", { ascending: false })
    .returns<DemoProfileRow[]>();

  if (error || !demoProfiles) {
    throw new Error(
      `Failed to read internal demo profiles: ${error?.message ?? "No rows returned"}`,
    );
  }

  const orderedInternalProfiles = demoProfiles.filter((profile) =>
    isInternalDemoProfile(profile.display_name),
  );

  if (orderedInternalProfiles.length < 4) {
    throw new Error(
      `Expected at least 4 internal demo profiles, found ${orderedInternalProfiles.length}.`,
    );
  }

  const actualFirstFour = orderedInternalProfiles
    .slice(0, 4)
    .map((profile) => profile.display_name);
  const expectedFirstFour = INTERNAL_DEMO_PROFILE_NAMES.slice(0, 4);

  for (const [index, expectedName] of expectedFirstFour.entries()) {
    const actualName = actualFirstFour[index];
    if (actualName !== expectedName) {
      throw new Error(
        `Internal demo Discover order mismatch at position ${index + 1}: expected ${expectedName}, got ${actualName ?? "(missing)"}.`,
      );
    }
  }

  for (const profile of orderedInternalProfiles.slice(0, 4)) {
    const ordinal = getInternalDemoOrdinal(profile.display_name);
    const expectedMatch = shouldAutoMatchInternalDemoProfile(profile.display_name);

    if (!ordinal || !profile.display_name) {
      throw new Error("Internal demo profile was missing its ordinal or display name.");
    }

    await resetInternalDemoJourney(supabase, userId);
    await insertLike(userId, profile.id);

    if (expectedMatch) {
      await insertLike(profile.id, userId);
    }

    const match = await findMatch(userId, profile.id);

    if (expectedMatch && !match) {
      throw new Error(
        `Expected seeded demo position ${ordinal} (${profile.display_name}) to auto-match.`,
      );
    }

    if (!expectedMatch && match) {
      throw new Error(
        `Expected seeded demo position ${ordinal} (${profile.display_name}) not to auto-match.`,
      );
    }

    console.log(
      `- Demo position ${ordinal}: ${profile.display_name} -> ${
        expectedMatch ? "match" : "no match"
      }`,
    );
  }

  await resetInternalDemoJourney(supabase, userId);
}

async function main() {
  const runId = Date.now();
  const password = `TestPassword-${randomUUID()}!`;

  const demoAssertions: Array<[string, boolean, boolean]> = [
    ["Internal Test Alex", true, false],
    ["Internal Test Maya", true, true],
    ["Daniel Brooks", true, false],
    ["Priya Shah", true, true],
    ["Not A Demo Profile", false, false],
  ];

  for (const [name, expectedInternal, expectedMatch] of demoAssertions) {
    if (isInternalDemoProfile(name) !== expectedInternal) {
      throw new Error(
        `Internal demo detection mismatch for ${name}: expected ${expectedInternal}`,
      );
    }
    if (shouldAutoMatchInternalDemoProfile(name) !== expectedMatch) {
      throw new Error(
        `Internal demo alternating rule mismatch for ${name}: expected ${expectedMatch}`,
      );
    }
  }

  console.log("Verified internal demo matching rule.");

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

    await verifyInternalDemoAlternatingMatches(userAId);

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

    console.log("Creating Q&A session proposal...");

    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data: qaSession, error: qaInsertError } = await supabase
      .from("qa_sessions")
      .insert({
        match_id: match.id,
        scheduled_at: scheduledAt,
        proposed_by_id: userAId,
      })
      .select("id, match_id, scheduled_at, proposed_by_id, confirmed_at, status")
      .single();

    if (qaInsertError || !qaSession) {
      throw new Error(`Failed to create Q&A session: ${qaInsertError?.message}`);
    }

    if (qaSession.confirmed_at !== null) {
      throw new Error("Expected Q&A session to be unconfirmed at proposal stage.");
    }

    console.log("Confirming Q&A session...");

    const confirmedAt = new Date().toISOString();

    const { data: confirmedSession, error: qaConfirmError } = await supabase
      .from("qa_sessions")
      .update({
        confirmed_at: confirmedAt,
      })
      .eq("id", qaSession.id)
      .select("id, confirmed_at")
      .single();

    if (qaConfirmError || !confirmedSession) {
      throw new Error(`Failed to confirm Q&A session: ${qaConfirmError?.message}`);
    }

    if (!confirmedSession.confirmed_at) {
      throw new Error("Expected Q&A session to have confirmed_at set.");
    }

    console.log("Updating match status to qa_scheduled...");

    const { data: scheduledMatch, error: matchUpdateError } = await supabase
      .from("matches")
      .update({
        status: "qa_scheduled",
      })
      .eq("id", match.id)
      .select("id, status")
      .single();

    if (matchUpdateError || !scheduledMatch) {
      throw new Error(`Failed to update match status: ${matchUpdateError?.message}`);
    }

    if (scheduledMatch.status !== "qa_scheduled") {
      throw new Error(`Expected match status qa_scheduled, got ${scheduledMatch.status}`);
    }

    console.log("Product-flow test passed:");
    console.log("- User A liked User B");
    console.log("- User B liked User A");
    console.log(`- Match created with status: ${match.status}`);
    console.log("- Q&A session proposal created");
    console.log("- Q&A session confirmed");
    console.log(`- Match moved to status: ${scheduledMatch.status}`);
    console.log(`- Match ID: ${match.id}`);
    console.log(`- Q&A Session ID: ${qaSession.id}`);
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
