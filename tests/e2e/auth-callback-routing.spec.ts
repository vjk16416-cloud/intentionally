import { expect, test } from "@playwright/test";

import {
  DEFAULT_POST_AUTH_PATH,
  getLoginPath,
  getSafeNextPath,
  getSafeNextPathValue,
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
      "http://localhost:3000/auth/callback?next=/chat/123?source=magic",
    );

    expect(
      resolvePostAuthRedirectPath({ url, onboardingComplete: true }),
    ).toBe("/chat/123?source=magic");
  });

  test("accepts a safe internal next value outside the callback URL", () => {
    expect(getSafeNextPathValue("/qa/session-123?source=login")).toBe(
      "/qa/session-123?source=login",
    );
  });

  test("builds a login URL that preserves the intended internal destination", () => {
    expect(getLoginPath("/date-plan/match-123?step=safety")).toBe(
      "/login?next=%2Fdate-plan%2Fmatch-123%3Fstep%3Dsafety",
    );
  });

  test("falls back to discover for unsafe next values", () => {
    const url = new URL("http://localhost:3000/auth/callback?next=//evil.example");

    expect(getSafeNextPath(url)).toBe(DEFAULT_POST_AUTH_PATH);
    expect(getSafeNextPathValue("https://evil.example/phish")).toBe(
      DEFAULT_POST_AUTH_PATH,
    );
    expect(getLoginPath("//evil.example/phish")).toBe(
      "/login?next=%2Fdiscover",
    );
    expect(DEFAULT_POST_AUTH_PATH).toBe("/discover");
  });
});
