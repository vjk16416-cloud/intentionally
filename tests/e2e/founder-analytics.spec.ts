import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const baseUrl = process.env.FOUNDER_ANALYTICS_TEST_BASE_URL ?? "http://localhost:3000";
const founderEmail = process.env.FOUNDER_ANALYTICS_TEST_FOUNDER_EMAIL;
const nonFounderEmail = process.env.FOUNDER_ANALYTICS_TEST_NON_FOUNDER_EMAIL;

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
] as const;

type AuthCookie = {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | "lax" | "strict" | "none";
  };
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

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(1);
}

loadEnvFile(".env.local");

const canRun = Boolean(founderEmail && nonFounderEmail);
const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const admin = createClient(
  supabaseUrl,
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

test.describe("Founder Analytics access and responsive layout", () => {
  test.skip(
    !canRun,
    "Requires per-run Founder and non-Founder test emails supplied by the local test command.",
  );

  let founderUserId: string | undefined;
  let nonFounderUserId: string | undefined;
  let founderCookies: AuthCookie[] = [];
  let nonFounderCookies: AuthCookie[] = [];

  async function createSignedInUser(email: string) {
    const password = `FounderAnalytics-${randomUUID()}!`;
    const { data: userData, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !userData.user) {
      throw new Error(`Failed to create ${email}: ${createError?.message}`);
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
      throw new Error(`Failed to sign in ${email}: ${signInError.message}`);
    }

    return { userId: userData.user.id, cookies };
  }

  test.beforeAll(async () => {
    if (!founderEmail || !nonFounderEmail) return;

    const founder = await createSignedInUser(founderEmail);
    founderUserId = founder.userId;
    founderCookies = founder.cookies;

    const nonFounder = await createSignedInUser(nonFounderEmail);
    nonFounderUserId = nonFounder.userId;
    nonFounderCookies = nonFounder.cookies;
  });

  test.afterAll(async () => {
    await Promise.all(
      [founderUserId, nonFounderUserId]
        .filter((userId): userId is string => Boolean(userId))
        .map((userId) => admin.auth.admin.deleteUser(userId)),
    );
  });

  test("redirects an unauthenticated request before dashboard content renders", async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/admin/analytics`);

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Private beta health" }),
    ).toHaveCount(0);
  });

  test("redirects an authenticated non-Founder to Discover", async ({
    browser,
  }) => {
    const cookieHeader = nonFounderCookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");
    const response = await fetch(`${baseUrl}/admin/analytics`, {
      headers: { cookie: cookieHeader },
      redirect: "manual",
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("/discover");

    const context = await browser.newContext();
    await addSessionCookies(context, nonFounderCookies);
    const page = await context.newPage();

    await page.goto(`${baseUrl}/admin/analytics`);

    await expect(
      page.getByRole("heading", { name: "Private beta health" }),
    ).toHaveCount(0);
    await context.close();
  });

  test("does not treat the local Founder development cookie as admin authorisation", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: "intentionally_local_founder_dev",
        value: "development-cookie-without-a-session",
        url: baseUrl,
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    const page = await context.newPage();

    await page.goto(`${baseUrl}/admin/analytics`);

    await expect(page).toHaveURL(/\/login$/);
    await context.close();
  });

  for (const viewport of viewports) {
    test(`loads safely for an authorised Founder at ${viewport.width}px`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ viewport });
      await addSessionCookies(context, founderCookies);
      const page = await context.newPage();

      await page.goto(`${baseUrl}/admin/analytics`);

      await expect(page).toHaveURL(/\/admin\/analytics$/);
      await expect(
        page.getByRole("heading", { name: "Private beta health" }),
      ).toBeVisible();
      await expect(page.getByText("Source unavailable")).toBeVisible();
      await expect(page.getByText("No metrics are shown as zero")).toBeVisible();
      await expect(page.getByRole("link", { name: "Analytics" })).toBeVisible();
      await expectNoHorizontalOverflow(page);
      await page.screenshot({
        path: `audit-screenshots/founder-analytics/${viewport.name}.png`,
        fullPage: true,
      });

      await context.close();
    });
  }
});
