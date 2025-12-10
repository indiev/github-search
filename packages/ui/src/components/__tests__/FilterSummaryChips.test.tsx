import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";

import UIProvider from "../../providers/UIProvider";
import FilterSummaryChips from "../FilterSummaryChips";

import type { ReactNode } from "react";

function renderWithUI(children: ReactNode) {
  return render(<UIProvider>{children}</UIProvider>);
}

describe("FilterSummaryChips", () => {
  it("renders chips and handles removal", () => {
    const handleRemove = jest.fn();

    renderWithUI(
      <FilterSummaryChips
        chips={[
          { key: "type", label: "Type: Users", onRemove: handleRemove },
          { key: "location", label: "Location: Seoul" },
        ]}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByText("Type: Users")).toBeInTheDocument();
    expect(screen.getByText("Location: Seoul")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Type: Users" }));
    expect(handleRemove).toHaveBeenCalled();
  });
});
