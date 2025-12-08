import { describe, expect, it, jest } from "@jest/globals";
import { configureStore } from "@reduxjs/toolkit";

import { createAppSlice } from "./createAppSlice";

// This file demonstrates the recommended testing patterns for slices and thunks
// using the shared `createAppSlice` helper.

type CounterState = {
  value: number;
  status: "idle" | "loading" | "succeeded" | "failed";
};

const initialState: CounterState = {
  value: 0,
  status: "idle",
};

// Example async function to be used in the thunk
const mockFetchCount = jest.fn<(amount: number) => Promise<number>>();

const counterSlice = createAppSlice({
  name: "counter",
  initialState,
  reducers: (create) => ({
    incremented: create.reducer((state) => {
      state.value += 1;
    }),
    amountAdded: create.reducer<{ amount: number }>((state, action) => {
      state.value += action.payload.amount;
    }),
    reset: create.reducer(() => initialState),
    fetchCount: create.asyncThunk(
      async (amount: number) => {
        const result = await mockFetchCount(amount);
        return result;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "succeeded";
          state.value += action.payload;
        },
        rejected: (state) => {
          state.status = "failed";
        },
      },
    ),
  }),
  selectors: {
    selectValue: (state) => state.value,
    selectStatus: (state) => state.status,
  },
});

const { actions, reducer, selectors } = counterSlice;

describe("createAppSlice - reducers", () => {
  it("handles the initial state", () => {
    const state = reducer(undefined, { type: "unknown" });

    expect(state).toEqual(initialState);
  });

  it("increments the value", () => {
    const state = reducer(initialState, actions.incremented());

    expect(state.value).toBe(1);
    expect(state.status).toBe("idle");
  });

  it("adds an arbitrary amount", () => {
    const state = reducer(initialState, actions.amountAdded({ amount: 5 }));

    expect(state.value).toBe(5);
  });

  it("resets to the initial state", () => {
    const preloadedState: CounterState = { value: 10, status: "succeeded" };

    const state = reducer(preloadedState, actions.reset());

    expect(state).toEqual(initialState);
  });
});

describe("createAppSlice - selectors", () => {
  it("selects value and status", () => {
    const sampleState: CounterState = { value: 42, status: "succeeded" };
    const rootStateLike = { counter: sampleState };

    expect(selectors.selectValue(rootStateLike)).toBe(42);
    expect(selectors.selectStatus(rootStateLike)).toBe("succeeded");
  });
});

describe("createAppSlice - async thunk", () => {
  it("dispatches pending and fulfilled on success", async () => {
    mockFetchCount.mockResolvedValueOnce(3);

    const store = configureStore({
      reducer: { counter: reducer },
    });

    await store.dispatch(actions.fetchCount(2));

    const state = store.getState().counter as CounterState;

    expect(mockFetchCount).toHaveBeenCalledWith(2);
    expect(state.status).toBe("succeeded");
    expect(state.value).toBe(3);
  });

  it("dispatches pending and rejected on failure", async () => {
    mockFetchCount.mockRejectedValueOnce(new Error("Network error"));

    const store = configureStore({
      reducer: { counter: reducer },
    });

    await store.dispatch(actions.fetchCount(2));

    const state = store.getState().counter as CounterState;

    expect(state.status).toBe("failed");
    expect(state.value).toBe(0);
  });
});
