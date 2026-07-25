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

async function addSessionCookies(
  context: BrowserContext,
  cookies: AuthCookie[],
) {
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
  const password = `Handoff-${randomUUID()}!`;
  const email = `handoff-${label}-${randomUUID()}@intentionally.local`;
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
    display_name: `Handoff ${label}`,
    date_of_birth: "1997-01-01",
    gender: label === "A" ? "man" : "woman",
    seeking: label === "A" ? ["woman"] : ["man"],
    intention: "long-term",
    bio_prompt_key: "best-sunday",
    bio_answer: "A calm walk and an honest conversation.",
    photos: [`test/handoff-${label}-1.jpg`, `test/handoff-${label}-2.jpg`],
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

async function likeProfile(user: TestUser, profileId: string) {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInError } = await client.auth.signInWithPassword({
    email: user.email,
    password: user.password,
  });
  if (signInError) throw new Error(`Failed to sign in ${user.email}`);

  const { error } = await client.from("swipes").insert({
    swiper_id: user.id,
    swipee_id: profileId,
    direction: "like",
  });
  if (error) throw new Error(`Failed to create reciprocal like: ${error.message}`);
}

test.describe("pending Vibe Check hand-off", () => {
  let userA: TestUser;
  let userB: TestUser;
  let userC: TestUser;
  let matchId: string;

  test.beforeAll(async () => {
    [userA, userB, userC] = await Promise.all([
      createTestUser("A"),
      createTestUser("B"),
      createTestUser("C"),
    ]);

    await likeProfile(userA, userB.id);
    await likeProfile(userB, userA.id);

    const { data: match, error } = await admin
      .from("matches")
      .select("id, status")
      .or(
        `and(user_a.eq.${userA.id},user_b.eq.${userB.id}),and(user_a.eq.${userB.id},user_b.eq.${userA.id})`,
      )
      .maybeSingle<{ id: string; status: string }>();

    if (error || !match) {
      throw new Error(`Expected reciprocal likes to create a match: ${error?.message}`);
    }
    if (match.status !== "pending_qa") {
      throw new Error(`Expected a pending match, received ${match.status}`);
    }

    matchId = match.id;
  });

  test.afterAll(async () => {
    await Promise.all(
      [userA, userB, userC]
        .filter((user): user is TestUser => Boolean(user))
        .map((user) => admin.auth.admin.deleteUser(user.id)),
    );
  });

  for (const viewport of [
    { name: "mobile", width: 390, height: 844, screenshot: "mobile.png" },
    { name: "tablet", width: 768, height: 1024, screenshot: "tablet.png" },
    { name: "desktop", width: 1280, height: 900, screenshot: "desktop.png" },
  ]) {
    test(`takes a confirmed match to its scheduler at ${viewport.name} size`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport });
      await addSessionCookies(context, userA.cookies);
      const page = await context.newPage();

      await page.goto(`${baseUrl}/vibe-checks`);
      await expect(
        page.getByText("No Vibe Checks waiting right now"),
      ).toHaveCount(0);

      await page.goto(`${baseUrl}/discover`);

      const waitingButton = page
        .getByRole("button")
        .filter({ hasText: "Vibe Check waiting" });
      await expect(waitingButton).toHaveCount(1);
      await waitingButton.click();

      const scheduleLink = page.getByRole("link", { name: "Choose a time" });
      await expect(scheduleLink).toHaveAttribute("href", `/schedule/${matchId}`);
      await expect(
        page.getByText("No Vibe Checks waiting right now"),
      ).toHaveCount(0);
      await page.screenshot({
        path: `audit-screenshots/vibe-check-invitation-handoff/${viewport.screenshot}`,
        fullPage: true,
      });
      await scheduleLink.click();

      await expect(page).toHaveURL(`${baseUrl}/schedule/${matchId}`);
      await expect(
        page.getByText("Schedule your Guided Vibe Check", { exact: true }),
      ).toBeVisible();
      await page.screenshot({
        path: `audit-screenshots/vibe-check-invitation-handoff/schedule-${viewport.screenshot}`,
        fullPage: true,
      });
      await context.close();
    });
  }

  test("does not expose another match's scheduler to a non-participant", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await addSessionCookies(context, userC.cookies);
    const page = await context.newPage();

    await page.goto(`${baseUrl}/schedule/${matchId}`);

    await expect(
      page.getByRole("heading", { name: "This page is not available" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Schedule your Guided Vibe Check" }),
    ).toHaveCount(0);
    await context.close();
  });
});
