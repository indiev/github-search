describe("Accessibility", () => {
  beforeEach(() => {
    cy.visitSearch();
    cy.injectAxe();
  });

  it("Should have no detectable accessibility violations on load", () => {
    cy.checkA11y();
  });
});
