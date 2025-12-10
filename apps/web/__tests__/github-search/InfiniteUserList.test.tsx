import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import {
  mockUseLazySearchUsersQuery,
  mockUseAppSelector,
  mockUseAppDispatch,
} from "../../__mocks__/storeMock";
import InfiniteUserList from "../../app/github-search/InfiniteUserList";
import { SearchProvider } from "../../app/github-search/SearchContext";

function makeUser(login: string) {
  return {
    login,
    type: "User",
    sponsorable: false,
    stats: {
      repositories: 0,
      followers: 0,
      joined: "2020-01-01T00:00:00Z",
    },
    location: "",
    languages: [],
  };
}

/**
 * Mapping to docs/requirements.md
 * - Paging: SSR first page + CSR infinite scroll
 * - Test requirements: search query, sort, paging logic & SSR/CSR boundary
 *
 * This file contains tests for InfiniteUserList behaviour.
 */

beforeEach(() => {
  mockUseLazySearchUsersQuery.mockReset();
  mockUseAppSelector.mockReset();
  mockUseAppDispatch.mockReset();
});

describe("InfiniteUserList paging and infinite scroll", () => {
  it("uses page 2 as the first CSR page when initial users exist", async () => {
    const unwrap = jest.fn(async () => ({
      users: [makeUser("user-3")],
      total_count: 3,
    }));

    const trigger = jest.fn(
      () =>
        ({
          unwrap,
        }) as unknown,
    );

    mockUseLazySearchUsersQuery.mockReturnValue([
      trigger,
      { isFetching: false },
    ]);
    mockUseAppSelector.mockReturnValue({
      isLimited: false,
      pendingRetryAt: null,
    });

    const initialNodes = [
      <div key="user-1" data-testid="user-card">
        user-1
      </div>,
      <div key="user-2" data-testid="user-card">
        user-2
      </div>,
    ];

    render(
      <SearchProvider>
        <InfiniteUserList
          initialUsers={initialNodes}
          initialTotalCount={3}
          initialUserIds={["user-1", "user-2"]}
        />
      </SearchProvider>,
    );

    expect(trigger).not.toHaveBeenCalled();

    const button = await screen.findByTestId("load-more-button");
    act(() => {
      button.click();
    });

    await waitFor(() => {
      expect(trigger).toHaveBeenCalledTimes(1);
    });

    const [[queryArg]] = trigger.mock.calls as unknown as [
      [{ page: number; q: string }],
    ];
    expect(queryArg.page).toBe(2);
    expect(queryArg.q).toBe("type:user");

    await screen.findByText("user-3");
  });

  it("auto-loads the first page when there are no initial users", async () => {
    const unwrap = jest.fn(async () => ({
      users: [makeUser("user-1")],
      total_count: 1,
    }));

    const trigger = jest.fn(
      () =>
        ({
          unwrap,
        }) as unknown,
    );

    mockUseLazySearchUsersQuery.mockReturnValue([
      trigger,
      { isFetching: false },
    ]);
    mockUseAppSelector.mockReturnValue({
      isLimited: false,
      pendingRetryAt: null,
    });

    render(
      <SearchProvider>
        <InfiniteUserList
          initialUsers={[]}
          initialTotalCount={0}
          initialUserIds={[]}
        />
      </SearchProvider>,
    );

    await waitFor(() => {
      expect(trigger).toHaveBeenCalledTimes(1);
    });

    const [[queryArg]] = trigger.mock.calls as unknown as [
      [{ page: number; q: string }],
    ];
    expect(queryArg.page).toBe(1);
    expect(queryArg.q).toBe("type:user");

    await screen.findByText("user-1");
  });

  it("shows the end message and does not request more pages when all results are loaded", async () => {
    const unwrap = jest.fn(async () => ({
      users: [makeUser("user-1")],
      total_count: 1,
    }));

    const trigger = jest.fn(
      () =>
        ({
          unwrap,
        }) as unknown,
    );

    mockUseLazySearchUsersQuery.mockReturnValue([
      trigger,
      { isFetching: false },
    ]);
    mockUseAppSelector.mockReturnValue({
      isLimited: false,
      pendingRetryAt: null,
    });

    render(
      <SearchProvider>
        <InfiniteUserList
          initialUsers={[]}
          initialTotalCount={0}
          initialUserIds={[]}
        />
      </SearchProvider>,
    );

    await waitFor(() => {
      expect(trigger).toHaveBeenCalledTimes(1);
    });

    await screen.findByText("user-1");
    await screen.findByText("모든 결과를 확인했습니다.");

    const button = await screen.findByTestId("load-more-button");
    act(() => {
      button.click();
    });

    await waitFor(() => {
      expect(trigger).toHaveBeenCalledTimes(1);
    });
  });

  it("skips loadMore when the rate limit is active", async () => {
    const unwrap = jest.fn(async () => ({
      users: [makeUser("user-1")],
      total_count: 1,
    }));

    const trigger = jest.fn(
      () =>
        ({
          unwrap,
        }) as unknown,
    );

    mockUseLazySearchUsersQuery.mockReturnValue([
      trigger,
      { isFetching: false },
    ]);
    mockUseAppSelector.mockReturnValue({
      isLimited: true,
      pendingRetryAt: null,
    });

    render(
      <SearchProvider>
        <InfiniteUserList
          initialUsers={[]}
          initialTotalCount={0}
          initialUserIds={[]}
        />
      </SearchProvider>,
    );

    const button = await screen.findByTestId("load-more-button");
    act(() => {
      button.click();
    });

    await waitFor(() => {
      expect(trigger).not.toHaveBeenCalled();
    });
  });

  it("avoids rendering duplicate user cards when the same login appears again", async () => {
    const unwrap = jest.fn(async () => ({
      users: [makeUser("user-1"), makeUser("user-2")],
      total_count: 2,
    }));

    const trigger = jest.fn(
      () =>
        ({
          unwrap,
        }) as unknown,
    );

    mockUseLazySearchUsersQuery.mockReturnValue([
      trigger,
      { isFetching: false },
    ]);
    mockUseAppSelector.mockReturnValue({
      isLimited: false,
      pendingRetryAt: null,
    });

    const initialNodes = [
      <div key="user-1" data-testid="user-card">
        user-1
      </div>,
    ];

    render(
      <SearchProvider>
        <InfiniteUserList
          initialUsers={initialNodes}
          initialTotalCount={2}
          initialUserIds={["user-1"]}
        />
      </SearchProvider>,
    );

    const button = await screen.findByTestId("load-more-button");
    act(() => {
      button.click();
    });

    await waitFor(() => {
      expect(trigger).toHaveBeenCalledTimes(1);
    });

    const cards = screen.getAllByTestId("user-card");
    const texts = cards.map((card) => card.textContent ?? "");

    expect(texts.filter((t) => t === "user-1")).toHaveLength(1);
    expect(texts).toContain("user-2");
  });

  it("does not call trigger while a previous request is fetching", async () => {
    const trigger = jest.fn(
      () =>
        ({
          unwrap: jest.fn(),
        }) as unknown,
    );

    mockUseLazySearchUsersQuery.mockReturnValue([
      trigger,
      { isFetching: true },
    ]);
    mockUseAppSelector.mockReturnValue({
      isLimited: false,
      pendingRetryAt: null,
    });

    render(
      <SearchProvider>
        <InfiniteUserList
          initialUsers={[]}
          initialTotalCount={0}
          initialUserIds={[]}
        />
      </SearchProvider>,
    );

    const button = await screen.findByTestId("load-more-button");
    act(() => {
      button.click();
    });

    await waitFor(() => {
      expect(trigger).not.toHaveBeenCalled();
    });
  });

  it("shows an error message and allows retry when the request fails", async () => {
    let callCount = 0;
    const unwrap = jest.fn(async () => {
      callCount += 1;
      if (callCount === 1) {
        throw {
          status: 500,
          data: { message: "Server error" },
        };
      }
      return {
        users: [makeUser("user-1")],
        total_count: 1,
      };
    });

    const trigger = jest.fn(
      () =>
        ({
          unwrap,
        }) as unknown,
    );

    mockUseLazySearchUsersQuery.mockReturnValue([
      trigger,
      { isFetching: false },
    ]);
    mockUseAppSelector.mockReturnValue({
      isLimited: false,
      pendingRetryAt: null,
    });

    render(
      <SearchProvider>
        <InfiniteUserList
          initialUsers={[]}
          initialTotalCount={0}
          initialUserIds={[]}
        />
      </SearchProvider>,
    );

    const button = await screen.findByTestId("load-more-button");
    act(() => {
      button.click();
    });

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    const retryButtons = screen.getAllByText("다시 시도");
    act(() => {
      retryButtons[0]?.click();
    });

    await waitFor(() => {
      expect(trigger).toHaveBeenCalledTimes(2);
    });
    await screen.findByText("user-1");
  });

  it("schedules an automatic retry when pendingRetryAt is set", async () => {
    jest.useFakeTimers();

    const unwrap = jest.fn(async () => ({
      users: [makeUser("user-1")],
      total_count: 1,
    }));

    const trigger = jest.fn(
      () =>
        ({
          unwrap,
        }) as unknown,
    );

    const now = new Date("2024-01-01T00:00:00.000Z").getTime();
    jest.setSystemTime(now);

    const pendingRetryAt = new Date(now + 1000).toISOString();

    mockUseLazySearchUsersQuery.mockReturnValue([
      trigger,
      { isFetching: false },
    ]);
    mockUseAppSelector.mockReturnValue({
      isLimited: true,
      pendingRetryAt,
    });

    mockUseAppDispatch.mockClear();

    render(
      <SearchProvider>
        <InfiniteUserList
          initialUsers={[]}
          initialTotalCount={0}
          initialUserIds={[]}
        />
      </SearchProvider>,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockUseAppDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: "rateLimit/retryCleared" }),
      );
    });

    jest.useRealTimers();
  });
});
