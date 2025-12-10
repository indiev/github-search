import { mount } from "cypress/react";

import TextField from "./TextField";

describe("<TextField />", () => {
  it("renders correctly", () => {
    mount(<TextField label="Test Input" />);
    cy.contains("label", "Test Input").should("be.visible");
  });

  it("accepts input", () => {
    const onChange = cy.stub().as("onChange");
    mount(<TextField label="Test Input" onChange={onChange} />);

    cy.get("input").type("Hello");
    cy.get("input").should("have.value", "Hello");
    cy.get("@onChange").should("have.been.called");
  });
});
