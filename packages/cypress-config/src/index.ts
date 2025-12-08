import { defineConfig } from "cypress";

const DEFAULT_PORT = Number(process.env.APP_PORT ?? process.env.PORT ?? 3000);
export const DEFAULT_BASE_URL =
  process.env.CYPRESS_BASE_URL ?? `http://127.0.0.1:${DEFAULT_PORT}`;

const registerBaseNodeEvents = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
): Cypress.PluginConfigOptions => {
  on("task", {
    log(message: unknown) {
      console.log(message);
      return null;
    },
    table(message: unknown) {
      console.table(message);
      return null;
    },
  });

  return config;
};

const baseConfig: Cypress.ConfigOptions = {
  video: false,
  screenshotOnRunFailure: true,
  trashAssetsBeforeRuns: true,
  reporter: "spec",
  retries: {
    runMode: 2,
    openMode: 0,
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  chromeWebSecurity: false,
  env: {
    githubUsersSearchApi: "https://api.github.com/search/users",
  },
  e2e: {
    baseUrl: DEFAULT_BASE_URL,
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    downloadsFolder: "cypress/downloads",
    fixturesFolder: "cypress/fixtures",
    screenshotsFolder: "cypress/screenshots",
    setupNodeEvents: registerBaseNodeEvents,
  },
};

export type CreateE2EConfigOverrides = Partial<Cypress.ConfigOptions>;

export function createE2EConfig(
  overrides: CreateE2EConfigOverrides = {},
): Cypress.ConfigOptions {
  const composedSetupNodeEvents =
    overrides.e2e?.setupNodeEvents !== undefined
      ? (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
          const nextConfig = registerBaseNodeEvents(on, config) ?? config;
          const customConfig =
            overrides.e2e?.setupNodeEvents?.(on, nextConfig ?? config) ??
            nextConfig;
          return customConfig ?? config;
        }
      : registerBaseNodeEvents;

  const mergedConfig: Cypress.ConfigOptions = {
    ...baseConfig,
    ...overrides,
    env: {
      ...baseConfig.env,
      ...overrides.env,
    },
    e2e: {
      ...baseConfig.e2e,
      ...overrides.e2e,
      setupNodeEvents: composedSetupNodeEvents,
    },
  };

  return defineConfig(mergedConfig);
}

export type CreateComponentConfigOverrides = Partial<Cypress.ConfigOptions>;

export function createComponentConfig(
  overrides: CreateComponentConfigOverrides = {},
): Cypress.ConfigOptions {
  const mergedConfig: Cypress.ConfigOptions = {
    ...baseConfig,
    ...overrides,
    component: {
      devServer: {
        framework: "next",
        bundler: "webpack",
      },
      ...overrides.component,
    },
  };

  return defineConfig(mergedConfig);
}

export const sharedE2EConfig = defineConfig(baseConfig);
