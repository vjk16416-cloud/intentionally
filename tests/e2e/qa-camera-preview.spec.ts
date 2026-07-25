import { expect, test } from "@playwright/test";

test.describe("Q&A camera preview route", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("http://localhost:3000/qa/demo-demo-match?started=true");

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /start with intention/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /send secure sign-in link/i })).toBeVisible();
  });

  test("redirects unauthenticated users from visibility choice to login", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/qa/demo-demo-match/visibility");

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /start with intention/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /send secure sign-in link/i })).toBeVisible();
  });
});

test.describe("auth callback safety", () => {
  test("does not show callback guidance on the normal login route", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/login");

    await expect(
      page.getByText(
        "We couldn’t complete your sign-in. Your link or code may have expired. Please request a new one.",
      ),
    ).toHaveCount(0);
  });

  test("rejects unsafe next paths without leaving the app origin", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/auth/callback?next=//evil.example");

    await expect(page).toHaveURL(
      "http://localhost:3000/login?error=auth_callback",
    );
    await expect(
      page.getByText(
        "We couldn’t complete your sign-in. Your link or code may have expired. Please request a new one.",
      ),
    ).toBeVisible();
  });
});
