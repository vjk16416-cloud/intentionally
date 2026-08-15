import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

test("Discover keeps Vibe Check behind mutual interest", () => {
  const source = readFileSync("app/(app)/discover/deck.tsx", "utf8");

  expect(source).not.toContain("Start Vibe Check");
  expect(source).not.toContain("Pass for now");
  expect(source).toContain(
    "If the interest is mutual, you’ll be able to invite each other to a guided 10-minute Vibe Check before chat unlocks.",
  );
  expect(source).toContain("Not for me");
  expect(source).toContain("I’m interested");
});
