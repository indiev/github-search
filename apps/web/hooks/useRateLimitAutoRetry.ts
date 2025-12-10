"use client";

import { useEffect, useRef } from "react";

import {
  useAppDispatch,
  useAppSelector,
  retryCleared,
  selectRateLimit,
} from "@repo/store";

/**
 * A custom hook to handle auto-retrying when a rate limit resets.
 * It monitors the `pendingRetryAt` state and triggers the provided callback
 * when the wait time has elapsed.
 *
 * @param onRetry - Function to call when the retry timer expires.
 */
export function useRateLimitAutoRetry(onRetry?: () => void) {
  const rateLimit = useAppSelector(selectRateLimit);
  const dispatch = useAppDispatch();

  // Use a ref to access the latest onRetry callback without triggering re-effects
  const onRetryRef = useRef(onRetry);

  useEffect(() => {
    onRetryRef.current = onRetry;
  }, [onRetry]);

  useEffect(() => {
    if (!rateLimit.pendingRetryAt) return;

    const delay = new Date(rateLimit.pendingRetryAt).getTime() - Date.now();

    if (delay <= 0) {
      // Already passed? Just clear the retry state.
      dispatch(retryCleared());
      return;
    }

    const timer = setTimeout(() => {
      // Auto-retry time reached!
      dispatch(retryCleared());

      // Execute the callback in the next tick to allow store updates to propagate
      // to the component (updating isLimited status) before the retry action.
      if (onRetryRef.current) {
        setTimeout(() => {
          onRetryRef.current?.();
        }, 0);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [rateLimit.pendingRetryAt, dispatch]);
}
