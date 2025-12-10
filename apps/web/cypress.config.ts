import { createComponentConfig } from "@repo/cypress-config";

export default createComponentConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/component.tsx",
  },
});
