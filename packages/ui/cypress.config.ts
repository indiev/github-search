import { createComponentConfig } from "@repo/cypress-config";

export default createComponentConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        resolve: {
          alias: {
            "next/font/google":
              "/Users/quester/Project/github-search/packages/ui/cypress/mocks/next-font-google.js",
            "next/link":
              "/Users/quester/Project/github-search/packages/ui/cypress/mocks/next-link.tsx",
          },
        },
      },
    },
    specPattern: "src/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.tsx",
  },
});
