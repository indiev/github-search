import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import { GitHubAPIError, GITHUB_API_BASE } from "../../lib/api-client";
import { searchUsers } from "../../lib/user-repository";

/**
 * Mapping to docs/requirements.md
 * - Implementation rules: sort, paging, Authorization header, rate limit handling
 * - Test requirements: data mapping and display safety
 *
 * This file contains concrete unit tests for the GitHub REST API wrapper.
 */

const originalFetch: typeof fetch | undefined = globalThis.fetch;

function createResponse(body: unknown, headersInit?: HeadersInit): Response {
  return {
    ok: true,
    status: 200,
    headers: new Headers(headersInit),
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  globalThis.fetch = jest.fn() as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch as typeof fetch;
  jest.resetAllMocks();
});

describe("searchUsers query parameters", () => {
  it("calls the GitHub search endpoint with the expected base URL and query string", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue(
      createResponse(
        {
          total_count: 0,
          incomplete_results: false,
          items: [],
        },
        {
          "x-ratelimit-limit": "60",
          "x-ratelimit-remaining": "59",
          "x-ratelimit-reset": "123456",
        },
      ),
    );

    await searchUsers({
      q: "type:user",
      page: 2,
      per_page: 50,
      sort: "followers",
      order: "desc",
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const firstCall = fetchMock.mock.calls[0] ?? [];
    const url = firstCall[0] as string;
    const parsed = new URL(url);

    expect(parsed.origin + parsed.pathname).toBe(
      `${GITHUB_API_BASE}/search/users`,
    );
    expect(parsed.searchParams.get("q")).toBe("type:user");
    expect(parsed.searchParams.get("page")).toBe("2");
    expect(parsed.searchParams.get("per_page")).toBe("50");
    expect(parsed.searchParams.get("sort")).toBe("followers");
    expect(parsed.searchParams.get("order")).toBe("desc");
  });

  it("uses default page and per_page when only q is provided", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue(
      createResponse({
        total_count: 0,
        incomplete_results: false,
        items: [],
      }),
    );

    await searchUsers({ q: "react" });

    const firstCall = fetchMock.mock.calls[0] ?? [];
    const url = firstCall[0] as string;
    const parsed = new URL(url);

    expect(parsed.searchParams.get("page")).toBe("1");
    expect(parsed.searchParams.get("per_page")).toBe("30");
  });

  it("throws an error when q is empty", async () => {
    await expect(searchUsers({ q: "" })).rejects.toThrow(
      "Query parameter 'q' is required",
    );
  });
});

describe("searchUsers authorization and security", () => {
  it("adds an Authorization header when GITHUB_TOKEN is defined", async () => {
    const previousToken = process.env.GITHUB_TOKEN;
    process.env.GITHUB_TOKEN = "test-token";

    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue(
      createResponse({
        total_count: 0,
        incomplete_results: false,
        items: [],
      }),
    );

    await searchUsers({ q: "react" });

    const call = fetchMock.mock.calls[0] ?? [];
    const options = call[1] as RequestInit;
    const headers = options.headers as Record<string, string>;

    expect(headers.Authorization).toBe("Bearer test-token");
    expect(headers.Accept).toBe("application/vnd.github.v3+json");
    expect(headers["X-GitHub-Api-Version"]).toBe("2022-11-28");

    process.env.GITHUB_TOKEN = previousToken;
  });

  it("omits the Authorization header when GITHUB_TOKEN is not set", async () => {
    const previousToken = process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_TOKEN;

    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue(
      createResponse({
        total_count: 0,
        incomplete_results: false,
        items: [],
      }),
    );

    await searchUsers({ q: "react" });

    const call = fetchMock.mock.calls[0] ?? [];
    const options = call[1] as RequestInit;
    const headers = options.headers as Record<string, string>;

    expect(headers.Authorization).toBeUndefined();
    expect(headers.Accept).toBe("application/vnd.github.v3+json");
    expect(headers["X-GitHub-Api-Version"]).toBe("2022-11-28");

    process.env.GITHUB_TOKEN = previousToken;
  });
});

describe("searchUsers response mapping and safety", () => {
  it("maps search items and detail responses into UserCardData objects", async () => {
    const item = {
      login: "alice",
      name: "Alice",
      avatar_url: "https://avatars.example.com/u/1",
      type: "User",
      public_repos: 10,
      followers: 5,
      created_at: "2021-01-01T00:00:00Z",
      location: "Seoul",
      bio: "Hello",
      html_url: "https://github.com/alice",
      url: "https://api.github.com/users/alice",
    };

    const detail = {
      ...item,
      public_repos: 20,
      followers: 10,
      created_at: "2022-02-02T00:00:00Z",
    };

    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock
      // First call: search response
      .mockResolvedValueOnce(
        createResponse({
          total_count: 1,
          incomplete_results: false,
          items: [item],
        }),
      )
      // Second call: detail response
      .mockResolvedValueOnce(createResponse(detail));

    const result = await searchUsers({ q: "alice" });

    expect(result.total_count).toBe(1);
    expect(result.users).toHaveLength(1);

    const user = result.users[0]!;
    expect(user.login).toBe("alice");
    expect(user.name).toBe("Alice");
    expect(user.avatarUrl).toBe(detail.avatar_url);
    expect(user.type).toBe("User");
    expect(user.stats.repositories).toBe(20);
    expect(user.stats.followers).toBe(10);
    expect(user.stats.joined).toBe(detail.created_at);
    expect(user.location).toBe("Seoul");
    expect(user.bio).toBe("Hello");
    expect(user.url).toBe("https://github.com/alice");
    expect(user.languages).toEqual([]);
  });

  it("applies safe defaults for missing numeric and date fields when detail fetch fails", async () => {
    const item = {
      login: "missing",
      avatar_url: "https://avatars.example.com/u/2",
      type: "User",
      // public_repos, followers, created_at intentionally omitted
      url: "https://api.github.com/users/missing",
      html_url: "https://github.com/missing",
    };

    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock
      .mockResolvedValueOnce(
        createResponse({
          total_count: 1,
          incomplete_results: false,
          items: [item],
        }),
      )
      // Detail fetch fails with a non-OK response, so searchUsers should fall back to the original item
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: new Headers(),
        json: async () => ({}),
      } as unknown as Response);

    const result = await searchUsers({ q: "missing" });

    expect(result.users).toHaveLength(1);
    const user = result.users[0]!;

    expect(user.stats.repositories).toBe(0);
    expect(user.stats.followers).toBe(0);
    expect(user.stats.joined).toBe("2000-01-01T00:00:00Z");
  });

  it("handles an empty items array and preserves total_count", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce(
      createResponse({
        total_count: 42,
        incomplete_results: false,
        items: [],
      }),
    );

    const result = await searchUsers({ q: "none" });

    expect(result.total_count).toBe(42);
    expect(result.users).toHaveLength(0);
  });
});

describe("searchUsers rate limit handling and retries", () => {
  it("parses x-ratelimit-* headers into a RateLimit object when a 403 response is returned", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers({
        "x-ratelimit-limit": "60",
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": "123456",
        "x-ratelimit-used": "60",
        "retry-after": "20", // force immediate throw (MAX_WAIT_MS exceeded)
      }),
      json: async () => ({ message: "rate limited" }),
    } as unknown as Response);

    await expect(searchUsers({ q: "react" })).rejects.toMatchObject({
      status: 403,
      rateLimit: {
        limit: 60,
        remaining: 0,
        reset: 123456,
        used: 60,
      },
    });
  });

  it("retries 403 responses and eventually succeeds when the backoff window is within MAX_WAIT_MS", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;

    const rateLimitedResponse = {
      ok: false,
      status: 403,
      headers: new Headers({
        // No retry-after, so exponential backoff (1s, 2s, ...) is used
        "x-ratelimit-limit": "60",
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": `${Math.floor(Date.now() / 1000) - 1}`,
      }),
      json: async () => ({ message: "secondary rate limit" }),
    } as unknown as Response;

    const successResponse = createResponse({
      total_count: 0,
      incomplete_results: false,
      items: [],
    });

    fetchMock
      .mockResolvedValueOnce(rateLimitedResponse)
      .mockResolvedValueOnce(rateLimitedResponse)
      .mockResolvedValueOnce(successResponse);

    const result = await searchUsers({ q: "react" });

    // Two failed attempts + one success
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.total_count).toBe(0);
  });

  it("attaches status, data, and rateLimit information to GitHubAPIError so that upper layers can expose remaining quota", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    const headers = new Headers({
      "x-ratelimit-limit": "60",
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": "123456",
    });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers,
      json: async () => ({ message: "too many requests" }),
    } as unknown as Response);

    try {
      await searchUsers({ q: "react" });
      throw new Error("Expected searchUsers to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(GitHubAPIError);
      const e = error as GitHubAPIError;
      expect(e.status).toBe(429);
      expect(e.data).toEqual({ message: "too many requests" });
      expect(e.rateLimit).toEqual({
        limit: 60,
        remaining: 0,
        reset: 123456,
        used: 0,
      });
    }
  });

  it("wraps non-rate-limit 4xx and 5xx errors in GitHubAPIError immediately without retrying", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers(),
      json: async () => ({ message: "internal error" }),
    } as unknown as Response);

    await expect(searchUsers({ q: "react" })).rejects.toBeInstanceOf(
      GitHubAPIError,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not expose raw response headers when propagating GitHubAPIError", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    const headers = new Headers({
      "x-ratelimit-limit": "60",
      "x-ratelimit-remaining": "0",
      "x-ratelimit-reset": "123456",
    });

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers,
      json: async () => ({ message: "forbidden" }),
    } as unknown as Response);

    try {
      await searchUsers({ q: "react" });
      throw new Error("Expected searchUsers to throw");
    } catch (error) {
      const e = error as GitHubAPIError;
      // Only the parsed rateLimit and data should be exposed, not the raw headers object
      expect((e as unknown as { headers: Headers }).headers).toBeUndefined();
      expect(e.data).toEqual({ message: "forbidden" });
    }
  });
});
