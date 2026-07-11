import { expect, test, type Page } from "@playwright/test";

const baseUrl = "http://localhost:3000";

const viewports = [
  { name: "small mobile", width: 375, height: 812 },
  { name: "standard mobile", width: 390, height: 844 },
  { name: "large mobile", width: 430, height: 932 },
  { name: "tablet portrait", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(1);
}

for (const viewport of viewports) {
  test.describe(`responsive layout at ${viewport.name}`, () => {
    test.use({ viewport });

    test("public entry points keep headings and CTAs visible", async ({
      page,
    }) => {
      await page.goto(baseUrl);

      await expect(page.getByText("Intentionally").first()).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Meet slowly. Choose clearly." }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Begin with intention" }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.goto(`${baseUrl}/login`);

      await expect(page.getByRole("heading", { name: /start with intention/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /continue as guest/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /send secure sign-in link/i })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.getByRole("link", { name: /continue as guest/i }).click();

      await expect(page).toHaveURL(/\/demo/);
      await expect(page.getByRole("heading", { name: /explore the vibe check journey/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /preview demo invite/i })).toBeVisible();
      await expect(page.getByText(/mock profiles/i)).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });

    test("protected app routes redirect without mobile overflow", async ({
      page,
    }) => {
      await page.goto(`${baseUrl}/discover`);

      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole("heading", { name: /start with intention/i })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.goto(`${baseUrl}/schedule/demo-demo-match`);

      await expect(page).toHaveURL(/\/login/);
      await expect(page.getByRole("button", { name: /send secure sign-in link/i })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  });
}
