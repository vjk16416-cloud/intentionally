import { expect, test, type Page } from "@playwright/test";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

function uniqueEmail(label: string) {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@example.test`;
}

async function waitForAuthEmail(email: string) {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const response = await fetch(`${MAILPIT_URL}/view/latest.html`, {
      cache: "no-store",
    });

    if (response.ok) {
      const html = await response.text();
      if (html.includes(`data-auth-email="${email}"`)) {
        return html;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for auth email for ${email}`);
}

function extractOtp(html: string) {
  const match = html.match(/data-auth-token=["'](\d{6})["']/i);
  if (!match) {
    throw new Error("Auth email did not contain a 6-digit OTP.");
  }

  return match[1];
}

function extractMagicLink(html: string) {
  const match = html.match(/id=["']magic-link["'][^>]*href=["']([^"']+)["']/i);
  if (!match) {
    throw new Error("Auth email did not contain the secure sign-in link.");
  }

  return match[1]
    .replaceAll("&amp;", "&")
    .replaceAll("&#38;", "&");
}

async function requestSignInEmail(page: Page, email: string) {
  await page.goto(`${APP_URL}/login?next=/discover`);
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send sign-in email" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
}

async function expectPersistentAuthenticatedSession(page: Page) {
  await page.waitForURL((url) => url.pathname.startsWith("/onboarding"), {
    timeout: 15_000,
  });

  await page.goto(`${APP_URL}/login`);
  await page.waitForURL((url) => url.pathname.startsWith("/onboarding"), {
    timeout: 15_000,
  });

  expect(new URL(page.url()).pathname).toMatch(/^\/onboarding/);
}

test.describe("live email authentication", () => {
  test.skip(
    process.env.EMAIL_AUTH_LIVE !== "1",
    "Runs only in the isolated local Supabase + Mailpit auth job.",
  );

  test("the 6-digit code from the generated email creates a persistent session", async ({
    page,
  }) => {
    const email = uniqueEmail("auth-code");

    await requestSignInEmail(page, email);
    const html = await waitForAuthEmail(email);
    const otp = extractOtp(html);

    await page.getByLabel("Enter the 6-digit email code").fill(otp);
    await page.getByRole("button", { name: "Verify email" }).click();

    await expectPersistentAuthenticatedSession(page);
  });

  test("the secure link from the generated email creates a persistent session", async ({
    page,
  }) => {
    const email = uniqueEmail("auth-link");

    await requestSignInEmail(page, email);
    const html = await waitForAuthEmail(email);
    const magicLink = extractMagicLink(html);

    await page.goto(magicLink);

    await expectPersistentAuthenticatedSession(page);
  });
});
