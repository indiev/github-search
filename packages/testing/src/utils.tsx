import { render } from "@testing-library/react";

import type { RenderOptions, RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";

// Export standard RTL for consistency if other packages import from here
export * from "@testing-library/react";

// Placeholder for future generic helpers (e.g., ThemeWrappers)
export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, "queries">,
): RenderResult {
  return render(ui, options);
}
