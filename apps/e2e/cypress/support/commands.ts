/* eslint-disable @typescript-eslint/no-namespace */

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Navigates to the home page so search specs always start at the SSR entry point.
       */
      visitSearch(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("visitSearch", () => {
  cy.visit("/");
});

export {};
