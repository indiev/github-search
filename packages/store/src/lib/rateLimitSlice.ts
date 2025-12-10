import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type TestLogEntry = Record<string, unknown>;

declare global {
  interface Window {
    __TEST_LOGS__?: TestLogEntry[];
  }
}

export type RateLimitResource = "core" | "search" | "graphql" | "unknown";

export interface RateLimitInfo {
  resource: RateLimitResource;
  limit: number | null;
  remaining: number | null;
  used: number | null;
  resetAt: string | null;
  resetEpochSeconds: number | null;
  retryAfterSeconds: number | null;
  isLimited: boolean;
  source: "header" | "header_fallback";
}

export interface RateLimitState extends RateLimitInfo {
  lastUpdatedAt: string | null;
  pendingRetryAt: string | null;
}

const initialState: RateLimitState = {
  resource: "unknown",
  limit: null,
  remaining: null,
  used: null,
  resetAt: null,
  resetEpochSeconds: null,
  retryAfterSeconds: null,
  isLimited: false,
  source: "header_fallback",
  lastUpdatedAt: null,
  pendingRetryAt: null,
};

export const rateLimitSlice = createSlice({
  name: "rateLimit",
  initialState,
  reducers: {
    rateLimitUpdated(state, action: PayloadAction<RateLimitInfo>) {
      Object.assign(state, action.payload);
      state.lastUpdatedAt = new Date().toISOString();
      if (typeof window !== "undefined") {
        const logs = window.__TEST_LOGS__ ?? [];
        if (!window.__TEST_LOGS__) {
          window.__TEST_LOGS__ = logs;
        }
        logs.push({
          type: "redux_rateLimitUpdated",
          payload: action.payload,
          newStateIsLimited: state.isLimited,
        });
      }
    },
    retryScheduled(
      state,
      action: PayloadAction<{ retryAfterSeconds: number }>,
    ) {
      const ts = new Date(
        Date.now() + action.payload.retryAfterSeconds * 1000,
      ).toISOString();
      state.pendingRetryAt = ts;
      state.isLimited = true;
      if (typeof window !== "undefined") {
        const logs = window.__TEST_LOGS__ ?? [];
        if (!window.__TEST_LOGS__) {
          window.__TEST_LOGS__ = logs;
        }
        logs.push({
          type: "redux_retryScheduled",
          payload: action.payload,
          newStateIsLimited: state.isLimited,
        });
      }
    },
    retryCancelled(state) {
      state.pendingRetryAt = null;
      // Keep isLimited = true so we don't immediately loop if the user cancels the wait.
      // The user must manually click retry (which calls retryCleared) to proceed.
    },
    retryCleared(state) {
      state.pendingRetryAt = null;
      state.isLimited = false;
    },
  },
});

export const {
  rateLimitUpdated,
  retryScheduled,
  retryCleared,
  retryCancelled,
} = rateLimitSlice.actions;

export const rateLimitReducer = rateLimitSlice.reducer;

export const selectRateLimit = (state: { rateLimit: RateLimitState }) =>
  state.rateLimit;
