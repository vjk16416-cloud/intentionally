import { expect, test } from "@playwright/test";

test.describe("Q&A camera preview route", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("http://localhost:3000/qa/demo-demo-match?started=true");

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /start with intention/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /send secure sign-in link/i })).toBeVisible();
  });
});
