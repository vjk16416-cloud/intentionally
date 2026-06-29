import { expect, test } from "@playwright/test";

import {
  DEFAULT_POST_AUTH_PATH,
  getSafeNextPath,
  resolvePostAuthRedirectPath,
} from "@/lib/auth/callback";

test.describe("auth callback redirect routing", () => {
  test("sends incomplete users to onboarding", () => {
    const url = new URL("http://localhost:3000/auth/callback?next=/discover");

    expect(
      resolvePostAuthRedirectPath({ url, onboardingComplete: false }),
    ).toBe("/onboarding");
  });

  test("sends complete users to the intended safe next path", () => {
    const url = new URL(
      "http://localhost:3000/auth/callback?next=/discover?source=magic",
    );

    expect(
      resolvePostAuthRedirectPath({ url, onboardingComplete: true }),
    ).toBe("/discover?source=magic");
  });

  test("falls back to discover for unsafe next values", () => {
    const url = new URL("http://localhost:3000/auth/callback?next=//evil.example");

    expect(getSafeNextPath(url)).toBe(DEFAULT_POST_AUTH_PATH);
    expect(DEFAULT_POST_AUTH_PATH).toBe("/discover");
  });
});
