describe("GitHub Search smoke", () => {
  beforeEach(() => {
    cy.visitSearch();
  });

  it("renders the landing headline", () => {
    cy.contains("Discover GitHub Users").should("be.visible");
  });

  it("shows the theme switcher required for system dark-mode support", () => {
    cy.get("#mode-select-label").should("contain.text", "Theme");
    cy.get("#mode-select").should("be.visible");
  });
});
