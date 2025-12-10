import { type ThunkDispatch, type UnknownAction } from "@reduxjs/toolkit";
import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

import {
  rateLimitUpdated,
  retryScheduled,
  type RateLimitInfo,
} from "../rateLimitSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/",
});

export const baseQueryWithRateLimit: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch = api.dispatch as ThunkDispatch<any, any, UnknownAction>;

  const extractRateLimit = (data: unknown): RateLimitInfo | null => {
    if (
      data &&
      typeof data === "object" &&
      "rateLimit" in data &&
      (data as { rateLimit: unknown }).rateLimit
    ) {
      return (data as { rateLimit: RateLimitInfo }).rateLimit;
    }
    return null;
  };

  const extractRateLimitFromHeaders = (
    headers: Headers,
  ): RateLimitInfo | null => {
    const limit = headers.get("x-ratelimit-limit");
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    const resource = headers.get("x-ratelimit-resource");
    const used = headers.get("x-ratelimit-used");

    if (limit && remaining && reset) {
      const resetSeconds = parseInt(reset, 10);
      return {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        used: used ? parseInt(used, 10) : 0,
        resetAt: new Date(resetSeconds * 1000).toISOString(),
        resetEpochSeconds: resetSeconds,
        retryAfterSeconds: null,
        isLimited: parseInt(remaining, 10) === 0,
        source: "header",
        resource: (resource || "core") as RateLimitInfo["resource"],
      };
    }
    return null;
  };

  // Handle Success
  if (result.meta?.response) {
    const rl = extractRateLimitFromHeaders(result.meta.response.headers);
    if (rl) {
      dispatch(rateLimitUpdated(rl));
    }
  }

  if (result.data) {
    const rl = extractRateLimit(result.data);
    if (rl) {
      dispatch(rateLimitUpdated(rl));
    }
  }

  // Handle Error
  if (result.error) {
    const { status, data } = result.error;
    const rl = extractRateLimit(data);
    if (rl) {
      dispatch(rateLimitUpdated(rl));
    }

    // Type guards/checks for error structure
    const hasMessage = (obj: unknown): obj is { message: string } =>
      !!obj && typeof obj === "object" && "message" in obj;

    const hasDataMessage = (
      obj: unknown,
    ): obj is { data: { message: string } } =>
      !!obj &&
      typeof obj === "object" &&
      "data" in obj &&
      hasMessage((obj as { data: unknown }).data);

    const hasRateLimitRemaining = (
      obj: unknown,
    ): obj is { rateLimit: { remaining: number } } =>
      !!obj &&
      typeof obj === "object" &&
      "rateLimit" in obj &&
      typeof (obj as { rateLimit: { remaining: unknown } }).rateLimit
        ?.remaining === "number";

    const isRateLimitError =
      status === 429 ||
      (status === 403 &&
        hasMessage(data) &&
        data.message.toLowerCase().includes("rate limit")) ||
      (hasDataMessage(data) &&
        data.data.message.toLowerCase().includes("rate limit")) ||
      (hasRateLimitRemaining(data) && data.rateLimit.remaining === 0);

    if (
      isRateLimitError &&
      data &&
      typeof data === "object" &&
      typeof window !== "undefined"
    ) {
      let seconds = 60; // Default 1 minute

      if ("retryAfterSeconds" in data) {
        seconds = (data as { retryAfterSeconds: number }).retryAfterSeconds;
      } else if (
        "rateLimit" in data &&
        (data as { rateLimit: { resetEpochSeconds?: number } }).rateLimit
          ?.resetEpochSeconds
      ) {
        // Calculate remaining seconds from reset timestamp
        const resetSeconds = (
          data as { rateLimit: { resetEpochSeconds: number } }
        ).rateLimit.resetEpochSeconds;
        const currentSeconds = Math.floor(Date.now() / 1000);
        seconds = Math.max(0, resetSeconds - currentSeconds);
      }

      // Cap wait time at 5 minutes to avoid excessive locking
      seconds = Math.min(seconds, 300);

      dispatch(retryScheduled({ retryAfterSeconds: seconds }));
    }
  }

  return result;
};
