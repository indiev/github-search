import baseConfig from "@repo/jest-config/react";

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...baseConfig,
  moduleNameMapper: {
    ...(baseConfig.moduleNameMapper || {}),
    "^@repo/avatar-wasm$": "<rootDir>/../avatar-wasm/src",
  },
  setupFilesAfterEnv: [
    ...(baseConfig.setupFilesAfterEnv || []),
    "./jest.setup.ts",
  ],
};
