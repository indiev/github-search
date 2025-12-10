import fs from "fs";
import path from "path";

import { describe, expect, it } from "@jest/globals";

/**
 * Mapping to docs/requirements.md
 * - Test execution instructions must be present in README.
 *
 * This file sketches tests that ensure documentation coverage for dev and test commands.
 */

function readReadme(relativePath: string): string | null {
  try {
    const fullPath = path.resolve(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath, "utf8");
  } catch {
    return null;
  }
}

function readAnyReadme(): string[] {
  const candidates = [
    "../../../../README.md", // repo root README
    "../../../README.md", // apps/web README
  ];

  return candidates
    .map(readReadme)
    .filter((content): content is string => Boolean(content));
}

describe("documentation for dev and test commands", () => {
  it("mentions how to start the dev server in a README", () => {
    const contents = readAnyReadme();
    const joined = contents.join("\n").toLowerCase();

    expect(joined).toMatch(/(pnpm|yarn|npm|bun)\s+dev/);
  });

  it("mentions how to run Jest unit tests in a README", () => {
    const contents = readAnyReadme();
    const joined = contents.join("\n").toLowerCase();

    // allow any of the common forms used in this monorepo
    expect(joined).toMatch(
      /(pnpm|yarn|npm)\s+(test|run test|--filter\s+web\s+test)/,
    );
  });

  it("links to requirements or testing strategy documentation so test requirements are discoverable", () => {
    const contents = readAnyReadme();
    const joined = contents.join("\n").toLowerCase();

    expect(joined).toMatch(/docs\/requirements\.md/);
    expect(joined).toMatch(/docs\/testing_strategy\.md/);
  });
});
