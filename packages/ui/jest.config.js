import baseConfig from "@repo/jest-config/react";

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...baseConfig,
  setupFilesAfterEnv: [
    ...(baseConfig.setupFilesAfterEnv || []),
    "./jest.setup.ts",
  ],
};
