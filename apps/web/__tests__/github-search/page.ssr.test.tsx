import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import { PAGE_SIZE } from "../../app/github-search/constants";

type SearchUsersType = typeof import("../../lib/user-repository").searchUsers;
type GitHubAPIErrorType = typeof import("../../lib/api-client").GitHubAPIError;
type PageType = typeof import("../../app/github-search/page").default;

/**
 * Mapping to docs/requirements.md
 * - Paging: first page rendered via SSR, further pages via CSR infinite scroll
 * - Test requirements: SSR/CSR boundary logic
 *
 * This file sketches SSR boundary tests for the /github-search page.
 */

jest.mock("../../lib/user-repository", () => {
  return {
    searchUsers: jest.fn(),
  };
});

let Page: PageType;
let GitHubAPIError: GitHubAPIErrorType;
let mockedSearchUsers: jest.MockedFunction<SearchUsersType>;

beforeAll(async () => {
  const pageModule = await import("../../app/github-search/page");
  Page = pageModule.default;

  const apiClientModule = await import("../../lib/api-client");
  const userRepositoryModule = await import("../../lib/user-repository");

  GitHubAPIError = apiClientModule.GitHubAPIError;
  mockedSearchUsers =
    userRepositoryModule.searchUsers as jest.MockedFunction<SearchUsersType>;
});

describe("github-search page SSR boundary", () => {
  it("calls searchUsers with default parameters when searchParams are empty", async () => {
    mockedSearchUsers.mockResolvedValue({
      users: [],
      total_count: 0,
    });

    await Page({ searchParams: Promise.resolve({}) });

    expect(mockedSearchUsers).toHaveBeenCalledTimes(1);
    expect(mockedSearchUsers).toHaveBeenCalledWith({
      q: "type:user",
      page: 1,
      per_page: PAGE_SIZE,
      sort: undefined,
    });
  });

  it("passes q and sort from searchParams into searchUsers", async () => {
    mockedSearchUsers.mockResolvedValue({
      users: [],
      total_count: 0,
    });

    await Page({
      searchParams: Promise.resolve({
        q: "language:TypeScript",
        sort: "followers",
      }) as unknown as Promise<{
        [key: string]: string | string[] | undefined;
      }>,
    });

    expect(mockedSearchUsers).toHaveBeenCalledWith({
      q: "language:TypeScript",
      page: 1,
      per_page: PAGE_SIZE,
      sort: "followers",
    });
  });

  it("propagates rate limit information into SearchRoot when searchUsers throws GitHubAPIError", async () => {
    const rateLimit = {
      limit: 60,
      remaining: 0,
      reset: 123456,
      used: 60,
    };

    mockedSearchUsers.mockRejectedValue(
      new GitHubAPIError("rate limited", 403, {}, rateLimit),
    );

    const result = await Page({
      searchParams: Promise.resolve({}),
    });

    const searchRootElement = (
      result as {
        props: { children: { props: { initialRateLimit: unknown } } };
      }
    ).props.children;

    expect(searchRootElement.props.initialRateLimit).toEqual(rateLimit);
  });
});
