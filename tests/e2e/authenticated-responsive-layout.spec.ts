import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const baseUrl = "http://localhost:3000";

const viewports = [
  { name: "small mobile", width: 375, height: 812 },
  { name: "standard mobile", width: 390, height: 844 },
  { name: "large mobile", width: 430, height: 932 },
  { name: "tablet portrait", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "wide desktop", width: 1440, height: 900 },
] as const;

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

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(1);
}

async function addSessionCookies(context: BrowserContext, cookiesToSet: AuthCookie[]) {
  await context.addCookies(
    cookiesToSet.map((cookie) => ({
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

type AuthCookie = {
  name: string;
  value: string;
  options: {
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: boolean | "lax" | "strict" | "none";
  };
};

loadEnvFile(".env.local");

const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const admin = createClient(supabaseUrl, requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false, autoRefreshToken: false },
});

test.describe("authenticated responsive app header", () => {
  let userId: string;
  let authCookies: AuthCookie[];

  test.beforeAll(async () => {
    const runId = Date.now();
    const email = `responsive-${runId}@intentionally.local`;
    const password = `TestPassword-${randomUUID()}!`;

    const { data: userData, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !userData.user) {
      throw new Error(`Failed to create responsive test user: ${createError?.message}`);
    }

    userId = userData.user.id;

    const { error: profileError } = await admin.from("profiles").upsert({
      id: userId,
      display_name: "Responsive Tester",
      date_of_birth: "1997-01-01",
      gender: "woman",
      seeking: ["man"],
      intention: "long-term",
      bio_prompt_key: "best-sunday",
      bio_answer: "A calm walk and an honest conversation.",
      photos: ["test/responsive-1.jpg", "test/responsive-2.jpg"],
      city: "London",
      neighbourhood: "Hackney",
      availability: [66, 67, 68, 69],
      id_verified: true,
      id_verified_at: new Date().toISOString(),
      paused: false,
    });

    if (profileError) {
      throw new Error(`Failed to prepare responsive test profile: ${profileError.message}`);
    }

    const { error: contactError } = await admin
      .from("trusted_contacts")
      .upsert(
        {
          user_id: userId,
          name: "Test Contact",
          phone_e164: "+447700900123",
        },
        { onConflict: "user_id" },
      );

    if (contactError) {
      throw new Error(`Failed to prepare responsive trusted contact: ${contactError.message}`);
    }

    const capturedCookies: AuthCookie[] = [];
    const browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => capturedCookies,
        setAll: (cookies) => {
          capturedCookies.splice(0, capturedCookies.length, ...cookies);
        },
      },
    });

    const { error: signInError } = await browserClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new Error(`Failed to sign in responsive test user: ${signInError.message}`);
    }

    authCookies = capturedCookies;
  });

  test.afterAll(async () => {
    if (userId) {
      await admin.auth.admin.deleteUser(userId);
    }
  });

  for (const viewport of viewports) {
    test(`app shell stays clear at ${viewport.name}`, async ({ browser }) => {
      const context = await browser.newContext({ viewport });
      await addSessionCookies(context, authCookies);
      const page = await context.newPage();

      await page.goto(`${baseUrl}/discover`);

      await expect(page.getByRole("heading", { name: /discover/i })).toBeVisible();
      await expect(page.getByText("Intentionally")).toBeVisible();

      const primaryNav = page.getByRole("navigation", { name: "Primary" });
      await expect(primaryNav).toBeVisible();
      await expect(page.getByRole("link", { name: "Discover" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();

      const navBox = await primaryNav.boundingBox();
      expect(navBox).not.toBeNull();
      if (viewport.width < 1024) {
        expect(navBox?.y ?? 0).toBeGreaterThan(viewport.height - 160);
        expect((navBox?.height ?? 0)).toBeGreaterThanOrEqual(52);
      } else {
        expect(navBox?.y ?? 0).toBeLessThan(160);
      }

      await expectNoHorizontalOverflow(page);

      await page.goto(`${baseUrl}/profile`);
      await expect(page.getByRole("heading", { name: /your profile/i })).toBeVisible();
      await expect(page.getByRole("link", { name: "Profile", exact: true })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await context.close();
    });
  }
});
