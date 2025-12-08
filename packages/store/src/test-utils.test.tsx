import { describe, expect, it, jest } from "@jest/globals";

import { baseAPI } from "./lib/base/base.api";
import { useAppSelector, useAppStore } from "./lib/hooks";
import { renderWithProviders } from "./test-utils";

import type { AppStore, RootState } from "./lib/store";

type RenderProbeProps = {
  onStore: (store: AppStore) => void;
  onState: (state: ReturnType<typeof useAppSelector>) => void;
};

function RenderProbe(props: RenderProbeProps) {
  const store = useAppStore();
  const state = useAppSelector((rootState) => rootState.api);

  props.onStore(store);
  props.onState(state);

  return null;
}

describe("renderWithProviders", () => {
  it("creates a store with the RTK Query api slice by default", () => {
    const handleStore = jest.fn();
    const handleState = jest.fn();

    const { store } = renderWithProviders(
      <RenderProbe onStore={handleStore} onState={handleState} />,
    );

    expect(store.getState()).toHaveProperty("api");
    expect(handleStore).toHaveBeenCalledWith(store);
    expect(handleState).toHaveBeenCalledWith(store.getState().api);
  });

  it("uses a pre-created store instance when provided", () => {
    const baseStore = renderWithProviders(<div />).store;
    const handleStore = jest.fn();

    const { store } = renderWithProviders(
      <RenderProbe onStore={handleStore} onState={jest.fn()} />,
      { store: baseStore },
    );

    expect(store).toBe(baseStore);
    expect(handleStore).toHaveBeenCalledWith(baseStore);
  });

  it("honors a provided preloaded state snapshot", () => {
    const apiInitialState = baseAPI.reducer(undefined, { type: "init" });
    const preloadedState: Partial<RootState> = {
      api: apiInitialState,
    };
    const handleState = jest.fn();

    const { store } = renderWithProviders(
      <RenderProbe onStore={jest.fn()} onState={handleState} />,
      { preloadedState },
    );

    expect(store.getState().api).toBe(apiInitialState);
    expect(handleState).toHaveBeenCalledWith(apiInitialState);
  });
});
