import { expect, test } from "@playwright/test";

test.describe("Q&A camera preview", () => {
  test.use({
    permissions: ["camera", "microphone"],
    launchOptions: {
      args: [
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
      ],
    },
  });

  test("shows the local camera preview inside the demo Q&A room", async ({ page }) => {
    await page.goto("/qa/demo-demo-match?started=true");

    await expect(page.getByText("Q&A Room")).toBeVisible();
    await expect(page.getByText("Question 1 of 3")).toBeVisible();
    await expect(page.getByText("You")).toBeVisible();
    await expect(page.getByText(/Camera on|Connecting/)).toBeVisible();

    const video = page.locator("video").first();
    await expect(video).toBeVisible();

    await expect(page.getByText("Maya")).toBeVisible();
    await expect(page.getByText("Listening")).toBeVisible();
  });
});
