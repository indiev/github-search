import { mount } from "cypress/react";

import ModeSwitch from "./ModeSwitch";
import UIProvider from "../providers/UIProvider";

describe("ModeSwitch Component", () => {
  it("renders the theme selector", () => {
    mount(
      <UIProvider>
        <ModeSwitch />
      </UIProvider>,
    );

    // Check if the input label exists
    cy.contains("Theme").should("exist");

    // Check if the select element exists (by its label)
    cy.get('[id="mode-select"]').should("exist");
  });

  it("allows changing the theme", () => {
    mount(
      <UIProvider>
        <ModeSwitch />
      </UIProvider>,
    );

    // Open the select menu
    cy.get('[id="mode-select"]').click();

    // Check if options are present
    cy.get('li[data-value="light"]').should("contain", "Light");
    cy.get('li[data-value="dark"]').should("contain", "Dark");
    cy.get('li[data-value="system"]').should("contain", "System");

    // Select Dark mode
    cy.get('li[data-value="dark"]').click();

    // Verify that the select value updated (MUI select usually updates the hidden input or the display)
    // Checking the displayed value which should be "Dark"
    cy.get('[id="mode-select"]').should("contain", "Dark");

    // Verify the actual DOM change for theme
    // Since InitColorSchemeScript is configured with attribute="class", we check for the class
    cy.get("html").should("have.class", "dark");
  });
});
