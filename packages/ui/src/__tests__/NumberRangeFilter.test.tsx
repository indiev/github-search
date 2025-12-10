import { describe, expect, it, jest } from "@jest/globals";
import {
  fireEvent,
  render,
  screen,
  within,
  type RenderResult,
} from "@testing-library/react";

import NumberRangeFilter from "../components/NumberRangeFilter";
import UIProvider from "../providers/UIProvider";

import type { ReactNode } from "react";

function renderWithUI(children: ReactNode): RenderResult {
  return render(<UIProvider>{children}</UIProvider>);
}

describe("NumberRangeFilter", () => {
  it("switches operators", () => {
    const handleChange = jest.fn();

    renderWithUI(
      <NumberRangeFilter
        label="Repos"
        value={{ operator: "gte", value: null }}
        onChange={handleChange}
      />,
    );

    fireEvent.mouseDown(screen.getByLabelText("비교 연산자"));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText("="));

    expect(handleChange).toHaveBeenCalledWith({ operator: "eq", value: null });
  });

  it("emits between values", () => {
    const handleChange = jest.fn();

    const { rerender } = renderWithUI(
      <NumberRangeFilter
        label="Followers"
        value={{ operator: "gte", value: null }}
        onChange={handleChange}
      />,
    );

    fireEvent.mouseDown(screen.getByLabelText("비교 연산자"));
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByText("Between"));

    expect(handleChange).toHaveBeenCalledWith({
      operator: "between",
      value: { min: null, max: null },
    });

    rerender(
      <NumberRangeFilter
        label="Followers"
        value={{ operator: "between", value: { min: null, max: null } }}
        onChange={handleChange}
      />,
    );

    handleChange.mockClear();

    fireEvent.change(screen.getByLabelText("최솟값"), {
      target: { value: "10" },
    });
    expect(handleChange).toHaveBeenCalledWith({
      operator: "between",
      value: { min: 10, max: null },
    });

    rerender(
      <NumberRangeFilter
        label="Followers"
        value={{ operator: "between", value: { min: 10, max: null } }}
        onChange={handleChange}
      />,
    );

    handleChange.mockClear();

    fireEvent.change(screen.getByLabelText("최댓값"), {
      target: { value: "20" },
    });
    expect(handleChange).toHaveBeenCalledWith({
      operator: "between",
      value: { min: 10, max: 20 },
    });
  });
});
