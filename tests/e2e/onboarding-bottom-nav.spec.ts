import { existsSync, readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import {
  availableLocalTestIdentities,
  type LocalTestIdentity,
  type LocalTestLoginEnvironment,
} from "@/app/(public)/login/local-test-login";

const baseUrl = "http://localhost:3000";

const ACCOUNT_LABELS = {
  man: "Test Man",
  woman: "Test Woman",
} as const satisfies Record<LocalTestIdentity, string>;

const routes = [
  "/onboarding/profile",
  "/onboarding/neighbourhood",
  "/onboarding/availability",
  "/onboarding/photos",
  "/onboarding/prompt",
];

const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 1000 },
];

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

loadEnvFile(".env.local");

const [localTestIdentity] = availableLocalTestIdentities(
  "localhost:3000",
  localTestEnvironment(),
);

test.describe("onboarding bottom navigation clearance", () => {
  test.skip(
    !localTestIdentity,
    "No named local test account is enabled in .env.local.",
  );

  test("shared StepNav does not cover final content", async ({ page }) => {
    if (!localTestIdentity) return;

    await page.goto(`${baseUrl}/login`);
    await Promise.all([
      page.waitForURL(/\/(discover|onboarding)/, { timeout: 15_000 }),
      page
        .getByRole("button", {
          name: `Continue as ${ACCOUNT_LABELS[localTestIdentity]}`,
        })
        .click(),
    ]);

    for (const viewport of viewports) {
      for (const route of routes) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });

        await page.evaluate(() =>
          window.scrollTo(0, document.documentElement.scrollHeight),
        );
        await page.waitForFunction(
          () =>
            window.scrollY >=
            document.documentElement.scrollHeight - window.innerHeight - 1,
        );

        const clearance = await page.evaluate(() => {
          const nav = document
            .querySelector(".fixed.inset-x-0.bottom-0")
            ?.getBoundingClientRect();
          const card = document
            .querySelector("main > div > section")
            ?.getBoundingClientRect();

          if (!nav || !card) return null;
          return nav.top - card.bottom;
        });

        expect(clearance).not.toBeNull();
        expect(clearance).toBeGreaterThanOrEqual(8);

        const navBox = await page
          .locator(".fixed.inset-x-0.bottom-0")
          .boundingBox();

        expect(navBox?.height).toBeGreaterThanOrEqual(64);
        expect(navBox?.y ?? 0).toBeGreaterThanOrEqual(0);
        expect((navBox?.y ?? 0) + (navBox?.height ?? 0)).toBeLessThanOrEqual(
          viewport.height + 1,
        );
      }
    }
  });
});
