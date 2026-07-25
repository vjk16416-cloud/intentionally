import { existsSync, readFileSync } from "node:fs";

import { createServerClient } from "@supabase/ssr";
import { expect, test } from "@playwright/test";

import {
  availableLocalTestIdentities,
  LOCAL_TEST_IDENTITIES,
  resolveLocalTestLogin,
  type LocalTestIdentity,
  type LocalTestLoginEnvironment,
} from "@/app/(public)/login/local-test-login";

const baseUrl = "http://localhost:3000";

const ACCOUNT_LABELS = {
  man: "Test Man",
  woman: "Test Woman",
} as const satisfies Record<LocalTestIdentity, string>;

const POLICY_ENVIRONMENT: LocalTestLoginEnvironment = {
  NODE_ENV: "development",
  DEV_TEST_LOGIN: "true",
  DEV_TEST_ALLOWED_HOST: "dev.intentionally.test",
  LOCAL_TEST_MAN_EMAIL: "test-man@example.test",
  LOCAL_TEST_MAN_PASSWORD: "man-password",
  LOCAL_TEST_WOMAN_EMAIL: "test-woman@example.test",
  LOCAL_TEST_WOMAN_PASSWORD: "woman-password",
};

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

function localTestEnvironment(): LocalTestLoginEnvironment {
  return {
    NODE_ENV: process.env.NODE_ENV,
    DEV_TEST_LOGIN: process.env.DEV_TEST_LOGIN,
    DEV_TEST_ALLOWED_HOST: process.env.DEV_TEST_ALLOWED_HOST,
    LOCAL_TEST_MAN_EMAIL: process.env.LOCAL_TEST_MAN_EMAIL,
    LOCAL_TEST_MAN_PASSWORD: process.env.LOCAL_TEST_MAN_PASSWORD,
    LOCAL_TEST_WOMAN_EMAIL: process.env.LOCAL_TEST_WOMAN_EMAIL,
    LOCAL_TEST_WOMAN_PASSWORD: process.env.LOCAL_TEST_WOMAN_PASSWORD,
  };
}

function configuredIdentities(host = "localhost:3000") {
  return availableLocalTestIdentities(host, localTestEnvironment());
}

function configuredEmail(identity: LocalTestIdentity) {
  return (
    identity === "man"
      ? process.env.LOCAL_TEST_MAN_EMAIL
      : process.env.LOCAL_TEST_WOMAN_EMAIL
  )?.trim();
}

loadEnvFile(".env.local");

test.describe("local app test login policy", () => {
  test("makes both named identities available on localhost and 127.0.0.1", () => {
    expect(
      availableLocalTestIdentities("localhost:3000", POLICY_ENVIRONMENT),
    ).toEqual(LOCAL_TEST_IDENTITIES);
    expect(
      availableLocalTestIdentities("127.0.0.1:3000", POLICY_ENVIRONMENT),
    ).toEqual(LOCAL_TEST_IDENTITIES);
  });

  test("makes both identities available only on the exact allowed development hostname", () => {
    expect(
      availableLocalTestIdentities(
        "dev.intentionally.test:3000",
        POLICY_ENVIRONMENT,
      ),
    ).toEqual(LOCAL_TEST_IDENTITIES);
    expect(
      availableLocalTestIdentities(
        "dev.intentionally.test.evil.example:3000",
        POLICY_ENVIRONMENT,
      ),
    ).toEqual([]);
  });

  test("selects the credentials for the requested identity", () => {
    expect(
      resolveLocalTestLogin("man", "localhost:3000", POLICY_ENVIRONMENT),
    ).toEqual({
      ok: true,
      identity: "man",
      credentials: {
        email: "test-man@example.test",
        password: "man-password",
      },
    });
    expect(
      resolveLocalTestLogin("woman", "localhost:3000", POLICY_ENVIRONMENT),
    ).toEqual({
      ok: true,
      identity: "woman",
      credentials: {
        email: "test-woman@example.test",
        password: "woman-password",
      },
    });
  });

  test("rejects every unknown identity", () => {
    expect(
      resolveLocalTestLogin("unknown", "localhost:3000", POLICY_ENVIRONMENT),
    ).toEqual({ ok: false, reason: "unknown_identity" });
    expect(
      resolveLocalTestLogin(null, "localhost:3000", POLICY_ENVIRONMENT),
    ).toEqual({ ok: false, reason: "unknown_identity" });
  });

  test("returns no controls when development test login is disabled", () => {
    const environment = {
      ...POLICY_ENVIRONMENT,
      DEV_TEST_LOGIN: "false",
    };

    expect(availableLocalTestIdentities("localhost:3000", environment)).toEqual(
      [],
    );
    expect(resolveLocalTestLogin("man", "localhost:3000", environment)).toEqual(
      { ok: false, reason: "disabled" },
    );
  });

  test("returns no controls in production", () => {
    const environment = {
      ...POLICY_ENVIRONMENT,
      NODE_ENV: "production",
    };

    expect(availableLocalTestIdentities("localhost:3000", environment)).toEqual(
      [],
    );
    expect(resolveLocalTestLogin("man", "localhost:3000", environment)).toEqual(
      { ok: false, reason: "production" },
    );
  });

  test("rejects unapproved hosts, IPv6 loopback, and alternate IPv4 spellings", () => {
    expect(
      resolveLocalTestLogin(
        "man",
        "unapproved.intentionally.test:3000",
        POLICY_ENVIRONMENT,
      ),
    ).toEqual({ ok: false, reason: "unapproved_host" });
    expect(
      resolveLocalTestLogin("man", "[::1]:3000", POLICY_ENVIRONMENT),
    ).toEqual({ ok: false, reason: "unapproved_host" });

    for (const host of [
      "127.1:3000",
      "2130706433:3000",
      "0x7f000001:3000",
      "017700000001:3000",
    ]) {
      expect(
        resolveLocalTestLogin("man", host, POLICY_ENVIRONMENT),
      ).toEqual({ ok: false, reason: "unapproved_host" });
    }
  });

  test("requires credentials for the selected identity", () => {
    const environment = {
      ...POLICY_ENVIRONMENT,
      LOCAL_TEST_WOMAN_PASSWORD: "",
    };

    expect(availableLocalTestIdentities("localhost:3000", environment)).toEqual([
      "man",
    ]);
    expect(
      resolveLocalTestLogin("woman", "localhost:3000", environment),
    ).toEqual({ ok: false, reason: "missing_credentials" });
  });
});

test.describe("local app test login UI", () => {
  test("keeps the normal email and phone login controls unchanged", async ({
    page,
  }) => {
    await page.goto(`${baseUrl}/login`);

    await expect(
      page.getByRole("button", { name: "Email", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Phone", exact: true }),
    ).toBeVisible();
    await expect(page.getByLabel("Email address")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send secure sign-in link" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Phone", exact: true }).click();

    await expect(page.getByLabel("Country code")).toBeVisible();
    await expect(page.getByLabel("Phone number")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Text me a sign-in code" }),
    ).toBeVisible();
  });

  test("shows both named buttons on localhost when enabled", async ({ page }) => {
    test.skip(
      configuredIdentities().length !== LOCAL_TEST_IDENTITIES.length,
      "Both named local test accounts are not enabled in .env.local.",
    );

    await page.goto(`${baseUrl}/login`);

    await expect(
      page.getByRole("heading", { name: "Development test accounts" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue as Test Man" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continue as Test Woman" }),
    ).toBeVisible();
  });

  test("shows both named controls for the exact configured development host", async ({
    request,
  }) => {
    const allowedHost = process.env.DEV_TEST_ALLOWED_HOST?.trim();
    test.skip(
      !allowedHost ||
        availableLocalTestIdentities(
          allowedHost,
          localTestEnvironment(),
        ).length !== LOCAL_TEST_IDENTITIES.length,
      "An exact allowed host and both named accounts are not enabled in .env.local.",
    );
    if (!allowedHost) return;

    const response = await request.get(`${baseUrl}/login`, {
      headers: { Host: allowedHost },
    });
    expect(response.ok()).toBe(true);

    const html = await response.text();
    expect(html).toContain("Development test accounts");
    expect(html).toContain("Continue as Test Man");
    expect(html).toContain("Continue as Test Woman");
  });

  test("does not render development controls for an unapproved host", async ({
    request,
  }) => {
    test.skip(
      configuredIdentities().length === 0,
      "No named local test account is enabled in .env.local.",
    );

    const configuredHost = process.env.DEV_TEST_ALLOWED_HOST?.trim().toLowerCase();
    const unapprovedHost =
      configuredHost === "unapproved.intentionally.test"
        ? "another-unapproved.intentionally.test"
        : "unapproved.intentionally.test";
    const response = await request.get(`${baseUrl}/login`, {
      headers: { Host: unapprovedHost },
    });
    expect(response.ok()).toBe(true);

    const html = await response.text();
    expect(html).not.toContain("Development test accounts");
    expect(html).not.toContain("Continue as Test Man");
    expect(html).not.toContain("Continue as Test Woman");
  });

  test("rejects a tampered identity submitted to the server action", async ({
    page,
  }) => {
    const [identity] = configuredIdentities();
    test.skip(
      !identity,
      "No named local test account is enabled in .env.local.",
    );
    if (!identity) return;

    await page.goto(`${baseUrl}/login`);
    const button = page.getByRole("button", {
      name: `Continue as ${ACCOUNT_LABELS[identity]}`,
    });

    await button.evaluate((element) => {
      const submitter = element as HTMLButtonElement;
      submitter.value = "unknown";
      submitter.form?.requestSubmit(submitter);
    });

    await expect(
      page.getByText("Choose a valid development test account.", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    const cookies = await page.context().cookies();
    expect(
      cookies.filter(
        (cookie) =>
          cookie.name.includes("auth-token") || cookie.name.startsWith("sb-"),
      ),
    ).toEqual([]);
  });

  for (const identity of LOCAL_TEST_IDENTITIES) {
    test(`creates the correct real Supabase session for ${identity}`, async ({
      page,
    }) => {
      const expectedEmail = configuredEmail(identity);
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
      const isConfigured = configuredIdentities().includes(identity);

      test.skip(
        !isConfigured || !expectedEmail || !supabaseUrl || !supabaseKey,
        `The ${identity} test account or public Supabase environment is not configured.`,
      );
      if (!isConfigured || !expectedEmail || !supabaseUrl || !supabaseKey) {
        return;
      }

      await page.goto(`${baseUrl}/login`);
      await Promise.all([
        page.waitForURL(/\/(discover|onboarding)(?:\/|$)/, { timeout: 15_000 }),
        page
          .getByRole("button", {
            name: `Continue as ${ACCOUNT_LABELS[identity]}`,
          })
          .click(),
      ]);

      const cookies = await page.context().cookies();
      const capturedAuthCookies = cookies.filter(
        (cookie) =>
          cookie.name.includes("auth-token") || cookie.name.startsWith("sb-"),
      );
      expect(capturedAuthCookies.length).toBeGreaterThan(0);

      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return cookies.map(({ name, value }) => ({ name, value }));
          },
          setAll() {},
        },
      });
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      expect(error).toBeNull();
      expect(user).not.toBeNull();
      expect(user?.email?.toLowerCase()).toBe(expectedEmail.toLowerCase());

      await page.reload();
      await expect(page).toHaveURL(
        (url) =>
          url.pathname === "/discover" ||
          url.pathname === "/onboarding" ||
          url.pathname.startsWith("/onboarding/"),
      );

      await page.goto(`${baseUrl}/discover`);
      await expect(page).not.toHaveURL(/\/login/);
    });
  }
});
