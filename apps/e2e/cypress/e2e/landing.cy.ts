const REQUIREMENTS_TODO = [
  "#1 user or organization only search",
  "#2 search by login, name, or email",
  "#3 filter by repository count",
  "#4 filter by location",
  "#5 filter by primary language",
  "#6 filter by account creation date",
  "#7 filter by follower count",
  "#8 filter by sponsorship availability",
] as const;

describe("GitHub Search smoke", () => {
  beforeEach(() => {
    cy.visitSearch();
  });

  it("renders the landing headline", () => {
    cy.contains("Hello world!").should("be.visible");
  });

  it("shows the theme switcher required for system dark-mode support", () => {
    cy.get("#mode-select-label").should("contain.text", "Theme");
    cy.get("#mode-select").should("be.visible");
  });

  REQUIREMENTS_TODO.forEach((requirement) => {
    it.skip(`TODO: ${requirement}`, () => {
      cy.task(
        "log",
        `docs/requirements.md -> Pending coverage for: ${requirement}`,
      );
    });
  });
});
