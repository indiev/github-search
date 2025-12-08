import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        resolve: {
          alias: {
            "next/font/google":
              "/Users/quester/Project/github-search/packages/ui/cypress/mocks/next-font-google.js",
          },
        },
      },
    },
    supportFile: false,
    specPattern: "src/**/*.cy.{ts,tsx}",
  },
});
