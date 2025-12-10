"use server";

import UserCard from "@repo/ui/components/UserCard";

import { PAGE_SIZE } from "./constants";
import { buildSearchQuery } from "./filterUtils";
import { GitHubAPIError, type RateLimit } from "../../lib/api-client";
import { searchUsers } from "../../lib/user-repository";

import type { FilterState, SortValue } from "./types";

export async function fetchMoreUsersAction(
  page: number,
  filters: FilterState,
  sort: SortValue,
): Promise<{
  nodes: React.ReactNode[];
  ids: string[];
  count: number;
  rateLimit?: RateLimit;
}> {
  const q = buildSearchQuery(filters) || "type:user";

  try {
    const { users, total_count, rateLimit } = await searchUsers({
      q,
      page,
      per_page: PAGE_SIZE,
      sort: sort === "default" ? undefined : sort,
    });

    const nodes = users.map((user) => (
      <UserCard
        key={user.login}
        user={user}
        className="mx-auto w-full max-w-[360px]"
      />
    ));

    return {
      nodes,
      ids: users.map((u) => u.login),
      count: total_count,
      rateLimit,
    };
  } catch (error) {
    console.error("fetchMoreUsersAction error:", error);
    let rateLimit: RateLimit | undefined;
    if (error instanceof GitHubAPIError) {
      rateLimit = error.rateLimit;
    }
    return { nodes: [], ids: [], count: 0, rateLimit };
  }
}
