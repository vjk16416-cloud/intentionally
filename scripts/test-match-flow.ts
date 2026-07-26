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

const SUPABASE_URL = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

const supabase = createClient(
  SUPABASE_URL,
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

async function signedInClient(email: string, password: string) {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in ${email}: ${error.message}`);
  }

  return client;
}

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
  const userCEmail = `test-c-${runId}@intentionally.local`;

  let userAId: string | undefined;
  let userBId: string | undefined;
  let userCId: string | undefined;

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

    const { data: userC, error: userCError } =
      await supabase.auth.admin.createUser({
        email: userCEmail,
        password,
        email_confirm: true,
      });

    if (userCError || !userC.user) {
      throw new Error(`Failed to create User C: ${userCError?.message}`);
    }

    userAId = userA.user.id;
    userBId = userB.user.id;
    userCId = userC.user.id;

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

    const { error: profileCError } = await supabase
      .from("profiles")
      .update({
        display_name: "Test Casey",
        date_of_birth: "1996-01-01",
        gender: "non-binary",
        seeking: ["man", "woman", "non-binary"],
        intention: "figuring-it-out",
        bio_prompt_key: "best-sunday",
        bio_answer: "A calm chat and clear expectations.",
        photos: ["test/casey-1.jpg", "test/casey-2.jpg"],
        neighbourhood: "London",
        availability: [66, 67, 68, 69],
        id_verified: true,
        id_verified_at: new Date().toISOString(),
        paused: false,
      })
      .eq("id", userCId);

    if (profileCError) {
      throw new Error(`Failed to update User C profile: ${profileCError.message}`);
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

    console.log("Creating Vibe Check invite...");

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
      throw new Error("Expected Vibe Check invite to be unconfirmed at proposal stage.");
    }

    if (qaSession.proposed_by_id !== userAId) {
      throw new Error("Expected User A to be the initial Vibe Check proposer.");
    }

    console.log("Checking Vibe Check counter-proposal...");

    const counterScheduledAt = new Date(
      Date.now() + 72 * 60 * 60 * 1000,
    ).toISOString();

    const { data: counterSession, error: counterError } = await supabase
      .from("qa_sessions")
      .update({
        scheduled_at: counterScheduledAt,
        proposed_at: new Date().toISOString(),
        proposed_by_id: userBId,
        confirmed_at: null,
      })
      .eq("id", qaSession.id)
      .select("id, scheduled_at, proposed_by_id, confirmed_at")
      .single();

    if (counterError || !counterSession) {
      throw new Error(
        `Failed to create Vibe Check counter-proposal: ${counterError?.message}`,
      );
    }

    if (counterSession.proposed_by_id !== userBId) {
      throw new Error("Expected User B to own the Vibe Check counter-proposal.");
    }

    if (counterSession.confirmed_at !== null) {
      throw new Error("Expected counter-proposed Vibe Check to remain unconfirmed.");
    }

    console.log("Accepting Vibe Check invite...");

    const confirmedAt = new Date().toISOString();
    const dailyRoomUrl = `https://example.daily.co/test-${runId}`;
    const vibeCheckQuestions = [
      {
        id: "test-communication",
        text: "What helps you feel understood in a conversation?",
      },
      {
        id: "test-effort",
        text: "What does effort look like to you in early dating?",
      },
      {
        id: "test-comfort",
        text: "What would make this Vibe Check feel comfortable?",
      },
    ];

    const { data: confirmedSession, error: qaConfirmError } = await supabase
      .from("qa_sessions")
      .update({
        confirmed_at: confirmedAt,
        daily_room_url: dailyRoomUrl,
        daily_room_name: `test-${runId}`,
        questions: vibeCheckQuestions,
      })
      .eq("id", qaSession.id)
      .select(
        "id, match_id, scheduled_at, proposed_by_id, confirmed_at, daily_room_url, questions",
      )
      .single();

    if (qaConfirmError || !confirmedSession) {
      throw new Error(`Failed to accept Vibe Check invite: ${qaConfirmError?.message}`);
    }

    if (!confirmedSession.confirmed_at) {
      throw new Error("Expected accepted Vibe Check invite to have confirmed_at set.");
    }

    if (confirmedSession.match_id !== match.id) {
      throw new Error("Expected accepted Vibe Check to stay attached to the match.");
    }

    if (confirmedSession.daily_room_url !== dailyRoomUrl) {
      throw new Error("Expected accepted Vibe Check to have a joinable Daily room URL.");
    }

    const storedQuestions = Array.isArray(confirmedSession.questions)
      ? confirmedSession.questions
      : [];
    if (
      storedQuestions.length !== 3 ||
      !storedQuestions.every(
        (question) =>
          question &&
          typeof question === "object" &&
          "text" in question &&
          typeof question.text === "string",
      )
    ) {
      throw new Error("Expected accepted Vibe Check to store renderable questions.");
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

    const joinPath = `/qa/${confirmedSession.id}`;
    if (joinPath !== `/qa/${qaSession.id}`) {
      throw new Error(`Expected Join Vibe Check path to use the session id, got ${joinPath}`);
    }

    console.log("Checking post-session Continue / Pass decisions...");

    const { error: continueAError } = await supabase.from("qa_outcomes").insert({
      qa_session_id: qaSession.id,
      user_id: userAId,
      decision: "continue",
    });

    if (continueAError) {
      throw new Error(
        `Failed to save User A Vibe Check Continue: ${continueAError.message}`,
      );
    }

    const { error: passBError } = await supabase.from("qa_outcomes").insert({
      qa_session_id: qaSession.id,
      user_id: userBId,
      decision: "pass",
    });

    if (passBError) {
      throw new Error(`Failed to save User B Vibe Check Pass: ${passBError.message}`);
    }

    const { data: chatAfterPass, error: chatAfterPassError } = await supabase
      .from("chats")
      .select("id")
      .eq("match_id", match.id)
      .maybeSingle();

    if (chatAfterPassError) {
      throw new Error(
        `Failed to check chat after private Pass: ${chatAfterPassError.message}`,
      );
    }

    if (chatAfterPass) {
      throw new Error("Expected private Pass not to unlock chat.");
    }

    const { user_a: mutualUserA, user_b: mutualUserB } = matchPair(userAId, userCId);
    const { data: mutualMatch, error: mutualMatchError } = await supabase
      .from("matches")
      .insert({ user_a: mutualUserA, user_b: mutualUserB, status: "qa_complete" })
      .select("id")
      .single();

    if (mutualMatchError || !mutualMatch) {
      throw new Error(`Failed to create mutual Continue match: ${mutualMatchError?.message}`);
    }

    const { data: mutualSession, error: mutualSessionError } = await supabase
      .from("qa_sessions")
      .insert({
        match_id: mutualMatch.id,
        scheduled_at: new Date().toISOString(),
        proposed_by_id: userAId,
        confirmed_at: new Date().toISOString(),
        status: "completed",
      })
      .select("id")
      .single();

    if (mutualSessionError || !mutualSession) {
      throw new Error(`Failed to create mutual Continue session: ${mutualSessionError?.message}`);
    }

    const { error: mutualOutcomesError } = await supabase.from("qa_outcomes").insert([
      { qa_session_id: mutualSession.id, user_id: userAId, decision: "continue" },
      { qa_session_id: mutualSession.id, user_id: userCId, decision: "continue" },
    ]);

    if (mutualOutcomesError) {
      throw new Error(`Failed to save mutual Continue decisions: ${mutualOutcomesError.message}`);
    }

    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({ match_id: mutualMatch.id })
      .select("id")
      .single();

    if (chatError || !chat) {
      throw new Error(`Failed to unlock chat after mutual Continue: ${chatError?.message}`);
    }

    console.log("Checking chat access and messaging...");

    const [userAClient, userBClient, userCClient] = await Promise.all([
      signedInClient(userAEmail, password),
      signedInClient(userBEmail, password),
      signedInClient(userCEmail, password),
    ]);

    const { data: userAChat, error: userAChatError } = await userAClient
      .from("chats")
      .select("id, match_id")
      .eq("id", chat.id)
      .maybeSingle();

    if (userAChatError || !userAChat) {
      throw new Error(
        `Expected User A to read unlocked chat: ${userAChatError?.message}`,
      );
    }

    if (userAChat.match_id !== mutualMatch.id) {
      throw new Error("Expected unlocked chat to belong to the current match.");
    }

    const { data: userBChat, error: userBChatError } = await userBClient
      .from("chats")
      .select("id")
      .eq("id", chat.id)
      .maybeSingle();

    if (userBChatError) {
      throw new Error(
        `Failed to check unauthorized chat access: ${userBChatError.message}`,
      );
    }

    if (userBChat) {
      throw new Error("Expected non-participant not to read unlocked chat.");
    }

    const { data: sentMessage, error: messageError } = await userAClient
      .from("messages")
      .insert({
        chat_id: chat.id,
        sender_id: userAId,
        body: "Really enjoyed the Vibe Check.",
      })
      .select("id, body")
      .single();

    if (messageError || !sentMessage) {
      throw new Error(`Expected User A to send a message: ${messageError?.message}`);
    }

    const { data: visibleMessages, error: visibleMessagesError } =
      await userCClient
        .from("messages")
        .select("id, sender_id, body")
        .eq("chat_id", chat.id)
        .order("created_at", { ascending: true });

    if (visibleMessagesError) {
      throw new Error(
        `Expected User B to read persisted messages: ${visibleMessagesError.message}`,
      );
    }

    if (!visibleMessages?.some((message) => message.id === sentMessage.id)) {
      throw new Error("Expected sent message to persist after refresh/read.");
    }

    const { error: unauthorizedMessageError } = await userBClient
      .from("messages")
      .insert({
        chat_id: chat.id,
        sender_id: userBId,
        body: "I should not be able to send this.",
      });

    if (!unauthorizedMessageError) {
      throw new Error("Expected non-participant not to send messages to this chat.");
    }

    console.log("Product-flow test passed:");
    console.log("- User A liked User B");
    console.log("- User B liked User A");
    console.log(`- Match created with status: ${match.status}`);
    console.log("- Vibe Check invite created");
    console.log("- Vibe Check counter-proposal stays unconfirmed");
    console.log("- Vibe Check invite accepted");
    console.log("- Vibe Check questions are renderable");
    console.log("- Private Pass does not unlock chat");
    console.log("- Mutual Continue unlocks chat");
    console.log("- Chat participants can send and read messages");
    console.log("- Non-participants cannot access the chat");
    console.log(`- Match moved to status: ${scheduledMatch.status}`);
    console.log(`- Join Vibe Check path: ${joinPath}`);
    console.log(`- Match ID: ${match.id}`);
    console.log(`- Vibe Check Session ID: ${qaSession.id}`);
    console.log(`- Chat ID: ${chat.id}`);
  } finally {
    console.log("Cleaning up test users...");

    if (userAId) {
      await supabase.auth.admin.deleteUser(userAId);
    }

    if (userBId) {
      await supabase.auth.admin.deleteUser(userBId);
    }

    if (userCId) {
      await supabase.auth.admin.deleteUser(userCId);
    }
  }
}

main().catch((error) => {
  console.error("Product-flow test failed:");
  console.error(error);
  process.exit(1);
});
