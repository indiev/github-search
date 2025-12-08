import { nextJsConfig } from "@repo/eslint-config/next-js";

const cypressGlobals = {
  cy: "readonly",
  Cypress: "readonly",
  expect: "readonly",
  assert: "readonly",
  describe: "readonly",
  it: "readonly",
  before: "readonly",
  beforeEach: "readonly",
  after: "readonly",
  afterEach: "readonly",
};

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextJsConfig,
  {
    files: ["cypress/**/*.{ts,tsx}"],
    languageOptions: {
      globals: cypressGlobals,
    },
  },
];

export default config;
