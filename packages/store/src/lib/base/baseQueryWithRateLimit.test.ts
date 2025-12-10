import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { baseQueryWithRateLimit } from "./baseQueryWithRateLimit";
import { retryScheduled } from "../rateLimitSlice";

jest.mock("@reduxjs/toolkit/query/react", () => ({
  fetchBaseQuery: jest.fn(() => jest.fn()),
}));

describe("baseQueryWithRateLimit", () => {
  let mockDispatch: jest.Mock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let api: any;
  let extraOptions: Record<string, unknown>;
  let mockBaseQuery: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn();
    api = { dispatch: mockDispatch };
    extraOptions = {};
    mockDispatch.mockClear();

    // Get the mock function instance that was returned when fetchBaseQuery was called
    const fetchBaseQueryMock = fetchBaseQuery as jest.Mock;
    const firstResult = fetchBaseQueryMock.mock.results[0];

    if (!firstResult || typeof firstResult.value !== "function") {
      throw new Error("fetchBaseQuery mock did not return a function");
    }

    mockBaseQuery = firstResult.value as jest.Mock;
    mockBaseQuery.mockClear();
  });

  it("should dispatch retryScheduled on 403 error with rate limit info", async () => {
    // Arrange: Mock base query to return 403 error with secondary rate limit message
    mockBaseQuery.mockResolvedValue({
      error: {
        status: 403,
        data: {
          message: "You have exceeded a secondary rate limit. Please wait...",
          rateLimit: {
            resetEpochSeconds: Math.floor(Date.now() / 1000) + 120, // 2 minutes from now
          },
        },
      },
    });

    // Act
    await baseQueryWithRateLimit("some-url", api, extraOptions);

    // Assert
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: retryScheduled.type,
        payload: expect.objectContaining({
          retryAfterSeconds: expect.any(Number),
        }),
      }),
    );

    // Verify seconds is approx 120
    const call = mockDispatch.mock.calls.find(
      (c) => c[0].type === retryScheduled.type,
    );
    expect(call[0].payload.retryAfterSeconds).toBeGreaterThanOrEqual(119);
    expect(call[0].payload.retryAfterSeconds).toBeLessThanOrEqual(121);
  });

  it("should dispatch retryScheduled on 429 error with retryAfterSeconds", async () => {
    // Arrange
    mockBaseQuery.mockResolvedValue({
      error: {
        status: 429,
        data: {
          retryAfterSeconds: 30,
        },
      },
    });

    // Act
    await baseQueryWithRateLimit("some-url", api, extraOptions);

    // Assert
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: retryScheduled.type,
        payload: { retryAfterSeconds: 30 },
      }),
    );
  });

  it("should NOT dispatch retryScheduled on generic 403 without rate limit data", async () => {
    // Arrange
    mockBaseQuery.mockResolvedValue({
      error: {
        status: 403,
        data: { message: "Forbidden" }, // No rate limit info
      },
    });

    // Act
    await baseQueryWithRateLimit("some-url", api, extraOptions);

    // Assert
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: retryScheduled.type }),
    );
  });
});
