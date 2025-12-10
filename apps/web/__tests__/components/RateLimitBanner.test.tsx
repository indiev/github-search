import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { render, screen, waitFor, act } from "@testing-library/react";

import {
  mockUseAppSelector,
  mockUseAppDispatch,
} from "../../__mocks__/storeMock";
import RateLimitBanner from "../../app/components/RateLimitBanner";
import RateLimitIndicator from "../../app/components/RateLimitIndicator";

/**
 * Mapping to docs/requirements.md
 * - Rate limit: retry behaviour and quota display
 *
 * This file contains tests for RateLimitBanner and RateLimitIndicator.
 */

beforeEach(() => {
  mockUseAppSelector.mockReset();
  mockUseAppDispatch.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("RateLimitBanner behaviour", () => {
  it("does not render when rate limit is not active and there is no pending retry", () => {
    mockUseAppSelector.mockReturnValue({
      isLimited: false,
      pendingRetryAt: null,
      remaining: null,
      limit: null,
      resource: "search",
    });

    const { container } = render(<RateLimitBanner onManualRetry={jest.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows a quota-exhausted message and remaining/limit text when remaining is 0", () => {
    mockUseAppSelector.mockReturnValue({
      isLimited: true,
      pendingRetryAt: null,
      remaining: 0,
      limit: 30,
      resource: "search",
      resetAt: new Date().toISOString(),
    });

    render(<RateLimitBanner onManualRetry={jest.fn()} />);

    expect(
      screen.getByText("기본 쿼터(30회)를 모두 사용했습니다."),
    ).toBeInTheDocument();
    expect(screen.getByText(/남은 쿼터: 0 \/ 30/)).toBeInTheDocument();
  });

  it("shows a secondary rate limit message when remaining is greater than 0 but a limit is active", () => {
    mockUseAppSelector.mockReturnValue({
      isLimited: true,
      pendingRetryAt: null,
      remaining: 10,
      limit: 30,
      resource: "search",
      resetAt: new Date().toISOString(),
    });

    render(<RateLimitBanner onManualRetry={jest.fn()} />);

    expect(
      screen.getByText("일시적인 요청 제한(Secondary Rate Limit)입니다."),
    ).toBeInTheDocument();
  });

  it("updates the countdown text based on pendingRetryAt and current time", async () => {
    jest.useFakeTimers();
    const now = new Date("2024-01-01T00:00:00.000Z").getTime();
    jest.setSystemTime(now);

    const pendingRetryAt = new Date(now + 3000).toISOString();

    mockUseAppSelector.mockReturnValue({
      isLimited: true,
      pendingRetryAt,
      remaining: 10,
      limit: 30,
      resource: "search",
      resetAt: new Date(now + 3000).toISOString(),
    });

    render(<RateLimitBanner onManualRetry={jest.fn()} />);

    expect(screen.getByText(/3초 후 자동 재시도/)).toBeInTheDocument();

    act(() => {
      jest.setSystemTime(now + 1000);
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/2초 후 자동 재시도/)).toBeInTheDocument();
    });
  });

  it("dispatches retryCleared and calls onManualRetry when the manual retry button is clicked", async () => {
    mockUseAppSelector.mockReturnValue({
      isLimited: true,
      pendingRetryAt: null,
      remaining: 0,
      limit: 30,
      resource: "search",
      resetAt: new Date().toISOString(),
    });

    const onManualRetry = jest.fn();

    render(<RateLimitBanner onManualRetry={onManualRetry} />);

    const button = screen.getByRole("button", { name: "지금 다시 시도" });
    button.click();

    await waitFor(() => {
      expect(mockUseAppDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: "rateLimit/retryCleared" }),
      );
      expect(onManualRetry).toHaveBeenCalled();
    });
  });

  it("dispatches retryCancelled when the cancel auto-retry button is clicked", async () => {
    jest.useFakeTimers();
    const now = Date.now();
    const pendingRetryAt = new Date(now + 3000).toISOString();

    mockUseAppSelector.mockReturnValue({
      isLimited: true,
      pendingRetryAt,
      remaining: 10,
      limit: 30,
      resource: "search",
      resetAt: new Date(now + 3000).toISOString(),
    });

    render(<RateLimitBanner onManualRetry={jest.fn()} />);

    const cancelButton = screen.getByRole("button", {
      name: "자동 재시도 취소",
    });
    cancelButton.click();

    await waitFor(() => {
      expect(mockUseAppDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: "rateLimit/retryCancelled" }),
      );
    });
  });
});

describe("RateLimitIndicator behaviour", () => {
  it("does not render when rate.limit is null", () => {
    mockUseAppSelector.mockReturnValue({
      limit: null,
      remaining: null,
    });

    const { container } = render(<RateLimitIndicator />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the search quota label when limit and remaining are set", () => {
    mockUseAppSelector.mockReturnValue({
      limit: 100,
      remaining: 50,
      resetAt: null,
    });

    render(<RateLimitIndicator />);

    expect(screen.getByText("Search quota 50/100")).toBeInTheDocument();
  });

  it("shows reset time in the tooltip title when resetAt is provided", () => {
    const resetAt = new Date("2024-01-01T12:00:00.000Z").toISOString();
    mockUseAppSelector.mockReturnValue({
      limit: 100,
      remaining: 50,
      resetAt,
    });

    render(<RateLimitIndicator />);

    const chip = screen.getByLabelText(/리셋 시각:/);
    expect(chip).toBeInTheDocument();
  });
});
