import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import React, { type PropsWithChildren } from "react";
import { Provider } from "react-redux";

import { makeStore } from "./lib/store";

import type { AppStore, RootState } from "./lib/store";

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
export interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

/**
 * A test utility to render a React component with a Redux store provider.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = makeStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
): RenderResult & { store: AppStore } {
  function Wrapper({ children }: PropsWithChildren): React.JSX.Element {
    return <Provider store={store}>{children}</Provider>;
  }

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  } as RenderResult & { store: AppStore };
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
