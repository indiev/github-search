import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState, type ReactNode } from "react";

import UIProvider from "@repo/ui/providers/UIProvider";

import {
  JOINED_DATE_PRESETS,
  LANGUAGE_OPTIONS,
  LOCATION_OPTIONS,
} from "../../app/github-search/constants";
import FilterPanel from "../../app/github-search/FilterPanel";
import { buildInitialFilterState } from "../../app/github-search/filterUtils";

function renderWithProviders(ui: ReactNode) {
  return render(<UIProvider>{ui}</UIProvider>);
}

function renderFilterPanel(
  handleApply: (
    nextFilters: ReturnType<typeof buildInitialFilterState>,
  ) => void,
) {
  const Wrapper = () => {
    const [filters, setFilters] = useState(buildInitialFilterState());

    return (
      <FilterPanel
        value={filters}
        onChange={setFilters}
        onApply={() => handleApply(filters)}
        onReset={jest.fn()}
        languageOptions={LANGUAGE_OPTIONS}
        locationOptions={LOCATION_OPTIONS}
        joinedPresets={JOINED_DATE_PRESETS}
      />
    );
  };

  return renderWithProviders(<Wrapper />);
}

describe("FilterPanel", () => {
  it("updates the type filter when a segmented button is clicked", () => {
    const handleChange = jest.fn();
    renderFilterPanel(handleChange);

    fireEvent.click(screen.getByRole("button", { name: "USER" }));
    // Wait for the update - but now we need to click search?
    // Wait, the requirement changed so now we MUST click search to see changes.
    // The previous tests assumed immediate (or debounced) update.
    // We should update ALL tests to click "Search" button.

    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: "user" }),
    );
  });

  it("toggles the sponsorable switch", () => {
    const handleChange = jest.fn();
    renderFilterPanel(handleChange);

    const switchElement = screen.getByTestId("sponsorable-switch");
    const input = within(switchElement).getByRole("switch");

    fireEvent.click(input);

    // Should NOT have called change yet
    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ sponsorableOnly: true }),
    );
  });

  it("updates filters only when search button is clicked (text input)", () => {
    const handleChange = jest.fn();
    renderFilterPanel(handleChange);

    const input = screen.getByPlaceholderText("Search...");
    fireEvent.change(input, { target: { value: "react" } });

    // Should not call immediately
    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({ text: "react" }),
    );
  });

  it("updates number range filter only when search button is clicked", () => {
    const handleChange = jest.fn();
    renderFilterPanel(handleChange);

    const minInputs = screen.getAllByLabelText("최솟값");
    const repoMinInput = minInputs[0];

    if (!repoMinInput) {
      throw new Error("Could not find Repositories min input");
    }

    fireEvent.change(repoMinInput, { target: { value: "10" } });

    // Should not call immediately
    expect(handleChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "검색" }));

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        repoCount: expect.objectContaining({
          value: expect.objectContaining({ min: 10 }),
        }),
      }),
    );
  });
});
