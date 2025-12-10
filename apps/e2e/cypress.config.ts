import { defineConfig } from "cypress";

import { createE2EConfig, DEFAULT_BASE_URL } from "@repo/cypress-config";

const FALLBACK_PORT = Number(process.env.PORT ?? 3000);
const baseUrl =
  process.env.CYPRESS_BASE_URL ??
  DEFAULT_BASE_URL ??
  `http://127.0.0.1:${FALLBACK_PORT}`;

export default defineConfig({
  ...createE2EConfig({
    env: {
      githubUsersSearchApi: "https://api.github.com/search/users",
    },
    defaultCommandTimeout: 8000,
    requestTimeout: 12000,
    viewportWidth: 1920,
    viewportHeight: 1080,
    e2e: {
      baseUrl,
      specPattern: ["cypress/e2e/**/*.cy.{ts,tsx}"],
      supportFile: "cypress/support/e2e.ts",
      setupNodeEvents(on, config) {
        return config;
      },
    },
  }),
});
