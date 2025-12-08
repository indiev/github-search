import { describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";

import { useAppStore } from "./lib/hooks";
import ReduxProvider from "./Provider";

import type { AppStore } from "./lib/store";

type StoreProbeProps = {
  onStore: (store: AppStore) => void;
};

function StoreProbe(props: StoreProbeProps) {
  const store = useAppStore();

  useEffect(() => {
    props.onStore(store);
  }, [props, store]);

  return null;
}

describe("ReduxProvider", () => {
  it("provides a single store instance across renders", async () => {
    const handleStore = jest.fn<(store: AppStore) => void>();

    const { rerender } = render(
      <ReduxProvider>
        <StoreProbe onStore={handleStore} />
      </ReduxProvider>,
    );

    rerender(
      <ReduxProvider>
        <StoreProbe onStore={handleStore} />
      </ReduxProvider>,
    );

    await waitFor(() => {
      expect(handleStore).toHaveBeenCalled();
    });

    const capturedStores = handleStore.mock.calls.map(
      (invocation) => invocation[0],
    );
    const uniqueStores = new Set(capturedStores);

    expect(uniqueStores.size).toBe(1);
  });
  it("renders children once the store is initialized", async () => {
    render(
      <ReduxProvider>
        <div>ready</div>
      </ReduxProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("ready")).toBeTruthy();
    });
  });
});
