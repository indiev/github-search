import { mount } from "cypress/react";

import SampleComponent from "./SampleComponent";

describe("<SampleComponent />", () => {
  it("renders with the correct title", () => {
    const title = "Hello Cypress";
    mount(<SampleComponent title={title} />);
    cy.get("h2").should("contain.text", title);
    cy.get("p").should("contain.text", "This is a sample component");
  });
});
