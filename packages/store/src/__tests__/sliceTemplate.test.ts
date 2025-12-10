import { describe, expect, it } from "@jest/globals";
import {
  configureStore,
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

interface ExampleState {
  value: number;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: ExampleState = {
  value: 0,
  status: "idle",
};

const exampleAsyncThunk = createAsyncThunk<number, number>(
  "example/fetchValue",
  async (input: number) => {
    return input * 2;
  },
);

const failingThunk = createAsyncThunk<void, void>("example/fail", async () => {
  throw new Error("failure");
});

const exampleSlice = createSlice({
  name: "example",
  initialState,
  reducers: {
    increment(state) {
      state.value += 1;
    },
    setValue(state, action: PayloadAction<number>) {
      state.value = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(exampleAsyncThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(exampleAsyncThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.value = action.payload;
      })
      .addCase(exampleAsyncThunk.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(failingThunk.rejected, (state) => {
        state.status = "failed";
      });
  },
});

const exampleReducer = exampleSlice.reducer;

describe("exampleSlice", () => {
  it("handles the initial state", () => {
    const state = exampleReducer(undefined, { type: "unknown" });

    expect(state).toEqual(initialState);
  });

  it("handles reducer logic for a known action", () => {
    const state = exampleReducer(
      initialState,
      exampleSlice.actions.increment(),
    );

    expect(state.value).toBe(initialState.value + 1);
    expect(state.status).toBe("idle");
  });
});

describe("exampleAsyncThunk", () => {
  it("dispatches fulfilled action on success and updates the store state", async () => {
    const store = configureStore({
      reducer: exampleReducer,
    });

    const result = await store.dispatch(exampleAsyncThunk(3));
    const state = store.getState() as ExampleState;

    expect(result.type).toBe("example/fetchValue/fulfilled");
    expect(state.status).toBe("succeeded");
    expect(state.value).toBe(6);
  });

  it("dispatches rejected action on failure", async () => {
    const store = configureStore({
      reducer: exampleReducer,
    });

    const result = await store.dispatch(failingThunk());
    const state = store.getState() as ExampleState;

    expect(result.type).toBe("example/fail/rejected");
    expect(state.status).toBe("failed");
  });
});
