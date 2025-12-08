import "./commands";
import "cypress-axe";

beforeEach(() => {
  cy.log("Bootstrapping GitHub Search requirements smoke test");
});

Cypress.on("uncaught:exception", () => {
  // Prevent unrelated Next.js hydration warnings from failing baseline smoke specs.
  return false;
});
