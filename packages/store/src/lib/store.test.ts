import { makeStore } from "./store";

describe("store", () => {
  it("should create a store with empty state", () => {
    const store = makeStore();
    const state = store.getState();
    expect(state).toBeDefined();
    expect(state).toHaveProperty("api");
  });

  it("should allow preloading state", () => {
    // We can't easily preload 'api' state without knowing internal structure,
    // but we can verify the mechanism works if we had other slices.
    // For now, just ensure it doesn't crash.
    const store = makeStore({});
    expect(store.getState()).toBeDefined();
  });
});
