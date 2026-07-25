import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const SOURCE_PATH = "app/(app)/qa/[sessionId]/qa-safety-controls.tsx";

test.describe("Q&A safety controls", () => {
  test("only exposes safety actions that work now", () => {
    const source = readFileSync(SOURCE_PATH, "utf8");

    expect(source).toContain("Pause for 30 seconds");
    expect(source).toContain("Switch to Soft Mode");
    expect(source).toContain("End Vibe Check privately");
    expect(source).toContain("Cancel");
    expect(source).toContain("your reason stays private");
    expect(source).toMatch(
      /className="[^\"]*focus-visible:ring-3[^\"]*"[\s\S]*aria-label="Safety options"/,
    );

    expect(source).not.toContain("Report concern");
    expect(source).not.toContain("Reporting will be available here soon");
    expect(source).not.toContain('"report"');
  });
});
