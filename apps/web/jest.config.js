import nextJest from "next/jest.js";

import baseConfig from "@repo/jest-config/next";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  ...baseConfig,
  moduleNameMapper: {
    ...(baseConfig.moduleNameMapper || {}),
    "^@repo/store$": "<rootDir>/__mocks__/storeMock.ts",
    "^@repo/ui/components/InfiniteScrollContainer$":
      "<rootDir>/__mocks__/InfiniteScrollContainerMock.tsx",
    "^@repo/ui/components/UserCard$": "<rootDir>/__mocks__/UserCardMock.tsx",
    "^@repo/ui/components/UserCardSkeleton$":
      "<rootDir>/__mocks__/UserCardSkeletonMock.tsx",
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
