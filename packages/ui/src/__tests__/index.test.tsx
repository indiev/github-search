import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";

import Button from "../primitives/Button";

describe("Button", () => {
  it("renders the given children", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });

    expect(button).toBeTruthy();
  });

  it("forwards props to the underlying MUI Button", () => {
    const handleClick = () => {};

    render(
      <Button variant="contained" color="primary" onClick={handleClick}>
        Submit
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Submit" });

    expect(button).toBeTruthy();
    expect(button.getAttribute("type")).toBe("button");
  });
});
