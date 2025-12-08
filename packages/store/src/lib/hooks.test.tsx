import { describe, expect, it, jest } from "@jest/globals";
import { waitFor } from "@testing-library/react";
import { useEffect } from "react";

import { renderWithProviders } from "../test-utils";
import { useAppDispatch, useAppSelector, useAppStore } from "./hooks";

import type { AppStore } from "./store";

type HooksListenerProps = {
  onDispatch: (dispatch: ReturnType<typeof useAppDispatch>) => void;
  onStore: (store: AppStore) => void;
  onState: (state: ReturnType<typeof useAppSelector>) => void;
};

function HooksListener({ onDispatch, onState, onStore }: HooksListenerProps) {
  const dispatch = useAppDispatch();
  const apiState = useAppSelector((rootState) => rootState.api);
  const store = useAppStore();

  useEffect(() => {
    onDispatch(dispatch);
    onState(apiState);
    onStore(store);
  }, [apiState, dispatch, onDispatch, onState, onStore, store]);

  return null;
}

describe("typed hooks", () => {
  it("exposes store-scoped helpers", async () => {
    const onDispatch = jest.fn();
    const onState = jest.fn();
    const onStore = jest.fn();

    const { store } = renderWithProviders(
      <HooksListener
        onDispatch={onDispatch}
        onState={onState}
        onStore={onStore}
      />,
    );

    await waitFor(() => {
      expect(onDispatch).toHaveBeenCalled();
      expect(onState).toHaveBeenCalled();
      expect(onStore).toHaveBeenCalled();
    });

    expect(onStore).toHaveBeenCalledWith(store);
    expect(onDispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(onState).toHaveBeenCalledWith(store.getState().api);
  });
});
