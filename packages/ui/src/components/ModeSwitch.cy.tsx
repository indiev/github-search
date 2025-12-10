import { ThemeProvider, createTheme } from "@mui/material/styles";
import { mount } from "cypress/react";

import ModeSwitch from "./ModeSwitch";

describe("ModeSwitch Component", () => {
  const theme = createTheme({
    cssVariables: true,
  });

  it("renders the theme selector", () => {
    mount(
      <ThemeProvider theme={theme}>
        <ModeSwitch />
      </ThemeProvider>,
    );

    // Check if the label exists
    cy.contains("Theme").should("exist");

    // Check if the ToggleButtons exist
    cy.contains("button", "System").should("exist");
    cy.contains("button", "Light").should("exist");
    cy.contains("button", "Dark").should("exist");
  });

  it("allows changing the theme", () => {
    mount(
      <ThemeProvider theme={theme}>
        <ModeSwitch />
      </ThemeProvider>,
    );

    // Select Dark mode
    cy.contains("button", "Dark").click();
    cy.contains("button", "Dark").should("have.attr", "aria-pressed", "true");

    // Select Light mode
    cy.contains("button", "Light").click();
    cy.contains("button", "Light").should("have.attr", "aria-pressed", "true");
  });
});
