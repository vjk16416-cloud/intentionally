import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { expect, test, type BrowserContext } from "@playwright/test";

const baseUrl = "http://localhost:3000";

type AuthCookie = {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | "lax" | "strict" | "none";
  };
};

type TestUser = {
  id: string;
  email: string;
  password: string;
  cookies: AuthCookie[];
};

type QaFixture = {
  sessionId: string;
  matchId: string;
};

function loadEnvFile(path: string) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed
      .slice(equalsIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) process.env[key] = value;
  }
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function addSessionCookies(context: BrowserContext, cookies: AuthCookie[]) {
  await context.addCookies(
    cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      url: baseUrl,
      httpOnly: cookie.options.httpOnly ?? false,
      secure: cookie.options.secure ?? false,
      sameSite:
        cookie.options.sameSite === "none"
          ? "None"
          : cookie.options.sameSite === "strict"
            ? "Strict"
            : "Lax",
    })),
  );
}

loadEnvFile(".env.local");

const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const admin = createClient(
  supabaseUrl,
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function createTestUser(label: string): Promise<TestUser> {
  const password = `QaOutcome-${randomUUID()}!`;
  const email = `qa-outcome-${label}-${randomUUID()}@intentionally.local`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    throw new Error(`Failed to create ${label}: ${error?.message}`);
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: data.user.id,
    display_name: `QA Outcome ${label}`,
    date_of_birth: "1997-01-01",
    gender: label === "A" ? "man" : "woman",
    seeking: label === "A" ? ["woman"] : ["man"],
    intention: "long-term",
    bio_prompt_key: "best-sunday",
    bio_answer: "A calm walk and an honest conversation.",
    photos: [
      `test/qa-outcome-${label}-1.jpg`,
      `test/qa-outcome-${label}-2.jpg`,
    ],
    city: "London",
    neighbourhood: "Hackney",
    availability: [66, 67, 68, 69],
    id_verified: true,
    id_verified_at: new Date().toISOString(),
    paused: false,
  });

  if (profileError) {
    throw new Error(`Failed to prepare ${label}'s profile: ${profileError.message}`);
  }

  const { error: contactError } = await admin.from("trusted_contacts").upsert(
    {
      user_id: data.user.id,
      name: "Test Contact",
      phone_e164: "+447700900123",
    },
    { onConflict: "user_id" },
  );

  if (contactError) {
    throw new Error(`Failed to prepare ${label}'s trusted contact: ${contactError.message}`);
  }

  const cookies: AuthCookie[] = [];
  const browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => cookies,
      setAll: (nextCookies) => {
        cookies.splice(0, cookies.length, ...nextCookies);
      },
    },
  });
  const { error: signInError } = await browserClient.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    throw new Error(`Failed to sign in ${label}: ${signInError.message}`);
  }

  return { id: data.user.id, email, password, cookies };
}

async function signedInClient(user: TestUser) {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });

  if (error) throw new Error(`Failed to sign in ${user.email}: ${error.message}`);
  return client;
}

async function createCompletedQaFixture(userA: TestUser, userB: TestUser): Promise<QaFixture> {
  const [user_a, user_b] = [userA.id, userB.id].sort();
  const { data: match, error: matchError } = await admin
    .from("matches")
    .insert({ user_a, user_b, status: "qa_complete" })
    .select("id")
    .single();

  if (matchError || !match) {
    throw new Error(`Failed to create test match: ${matchError?.message}`);
  }

  const { data: session, error: sessionError } = await admin
    .from("qa_sessions")
    .insert({
      match_id: match.id,
      scheduled_at: new Date().toISOString(),
      proposed_by_id: userA.id,
      confirmed_at: new Date().toISOString(),
      status: "completed",
      questions: [{ text: "What helps you feel understood?" }],
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error(`Failed to create completed Q&A: ${sessionError?.message}`);
  }

  return { matchId: match.id, sessionId: session.id };
}

async function submitDecision(
  browser: import("@playwright/test").Browser,
  user: TestUser,
  sessionId: string,
  buttonName: "Continue" | "Pass privately",
  expectedDestination: "waiting" | "chat" = "waiting",
) {
  const context = await browser.newContext();
  await addSessionCookies(context, user.cookies);
  const page = await context.newPage();

  await page.goto(`${baseUrl}/qa/${sessionId}`);
  await page.getByRole("button", { name: buttonName }).click();
  if (expectedDestination === "chat") {
    await expect(page).toHaveURL(/\/chat\/.+/);
  } else {
    await expect(page).toHaveURL(`${baseUrl}/qa/${sessionId}/waiting`);
  }

  return { context, page };
}

test.describe("Q&A outcome privacy", () => {
  let userA: TestUser;
  let userB: TestUser;
  let passUserA: TestUser;
  let passUserB: TestUser;
  let outsider: TestUser;

  test.beforeAll(async () => {
    [userA, userB, passUserA, passUserB, outsider] = await Promise.all([
      createTestUser("A"),
      createTestUser("B"),
      createTestUser("Pass-A"),
      createTestUser("Pass-B"),
      createTestUser("Outsider"),
    ]);
  });

  test.afterAll(async () => {
    await Promise.all(
      [userA, userB, passUserA, passUserB, outsider]
        .filter((user): user is TestUser => Boolean(user))
        .map((user) => admin.auth.admin.deleteUser(user.id)),
    );
  });

  test("keeps Continue private and unlocks chat only after mutual Continue", async ({
    browser,
  }) => {
    const { sessionId, matchId } = await createCompletedQaFixture(userA, userB);
    const firstSubmission = await submitDecision(browser, userA, sessionId, "Continue");
    await expect(firstSubmission.page.getByRole("heading", { name: "Decision saved" })).toBeVisible();

    const participantClient = await signedInClient(userB);
    const { data: participantOutcomes, error: participantReadError } = await participantClient
      .from("qa_outcomes")
      .select("user_id, decision")
      .eq("qa_session_id", sessionId);
    expect(participantReadError).toBeNull();

    const outsiderClient = await signedInClient(outsider);
    const { data: outsiderOutcomes, error: outsiderReadError } = await outsiderClient
      .from("qa_outcomes")
      .select("user_id, decision")
      .eq("qa_session_id", sessionId);
    expect(outsiderReadError).toBeNull();

    await firstSubmission.page.goto(`${baseUrl}/qa/${sessionId}`);
    await firstSubmission.page.getByRole("button", { name: "Pass privately" }).click();
    await expect(firstSubmission.page).toHaveURL(`${baseUrl}/qa/${sessionId}/waiting`);

    const { data: firstOutcome, error: firstOutcomeError } = await admin
      .from("qa_outcomes")
      .select("decision")
      .eq("qa_session_id", sessionId)
      .eq("user_id", userA.id)
      .single();
    expect(firstOutcomeError).toBeNull();
    expect(firstOutcome).toEqual({ decision: "continue" });

    const secondSubmission = await submitDecision(
      browser,
      userB,
      sessionId,
      "Continue",
      "chat",
    );
    await expect(secondSubmission.page).toHaveURL(/\/chat\/.+/);

    const { data: chats, error: chatError } = await admin
      .from("chats")
      .select("id")
      .eq("match_id", matchId);
    expect(chatError).toBeNull();
    expect(chats).toHaveLength(1);

    const { data: ownOutcomes, error: ownReadError } = await participantClient
      .from("qa_outcomes")
      .select("user_id, decision")
      .eq("qa_session_id", sessionId);
    expect(ownReadError).toBeNull();
    expect(ownOutcomes).toEqual([{ user_id: userB.id, decision: "continue" }]);
    expect(participantOutcomes).toEqual([]);
    expect(outsiderOutcomes).toEqual([]);

    await Promise.all([firstSubmission.context.close(), secondSubmission.context.close()]);
  });

  test("closes a Pass result without revealing which participant passed", async ({
    browser,
  }) => {
    const { sessionId, matchId } = await createCompletedQaFixture(passUserA, passUserB);
    const passSubmission = await submitDecision(browser, passUserA, sessionId, "Pass privately");
    await expect(passSubmission.page.getByRole("heading", { name: "Decision saved" })).toBeVisible();

    const participantClient = await signedInClient(passUserB);
    const { data: participantOutcomes, error: participantReadError } = await participantClient
      .from("qa_outcomes")
      .select("user_id, decision")
      .eq("qa_session_id", sessionId);
    expect(participantReadError).toBeNull();

    const continueSubmission = await submitDecision(browser, passUserB, sessionId, "Continue");
    await expect(
      continueSubmission.page.getByRole("heading", { name: "This match closed quietly." }),
    ).toBeVisible();
    await expect(continueSubmission.page.getByText("Pass privately")).toHaveCount(0);
    await expect(continueSubmission.page.getByText("QA Outcome A")).toHaveCount(0);

    const { data: chats, error: chatError } = await admin
      .from("chats")
      .select("id")
      .eq("match_id", matchId);
    expect(chatError).toBeNull();
    expect(chats).toEqual([]);

    const { data: closedMatch, error: closedMatchError } = await admin
      .from("matches")
      .select("status, closed_reason")
      .eq("id", matchId)
      .single();
    expect(closedMatchError).toBeNull();
    expect(closedMatch).toEqual({ status: "closed", closed_reason: null });

    const { data: ownOutcomes, error: ownReadError } = await participantClient
      .from("qa_outcomes")
      .select("user_id, decision")
      .eq("qa_session_id", sessionId);
    expect(ownReadError).toBeNull();
    expect(ownOutcomes).toEqual([{ user_id: passUserB.id, decision: "continue" }]);
    expect(participantOutcomes).toEqual([]);

    await Promise.all([passSubmission.context.close(), continueSubmission.context.close()]);
  });
});
