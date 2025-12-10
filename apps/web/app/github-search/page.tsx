import UserCard from "@repo/ui/components/UserCard";

import { PAGE_SIZE } from "./constants";
import { parseSearchQuery } from "./filterUtils";
import { SearchProvider } from "./SearchContext";
import SearchRoot from "./SearchRoot";
import { GitHubAPIError } from "../../lib/api-client";
import { searchUsers } from "../../lib/user-repository";

import type { RateLimit, SortValue } from "./types";

// Types are needed for initial filter construction if we parse URL params here
// But simpler to let SearchProvider use default and just pass initial data?
// No, initial data depends on filters. So we MUST parse URL params here.

// We need a way to parse searchParams back to FilterState to build the query
// Since buildSearchQuery takes FilterState.
// For now, let's assume default filters or simple q param if provided.
// Ideally we should have a 'parseParamsToFilterState' util.
// But as per plan: "Fetch initial data using lib/github.ts".

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const q = (resolvedParams.q as string) || "type:user";
  const sort = (resolvedParams.sort as string) || undefined;
  // TODO: reconstruct full FilterState from params if we want deep linking to work perfectly
  // For now, we trust the client 'filters' state mostly, BUT for the *first render*,
  // if we want SSR results to match what user sees, we need to sync.
  // Given the complexity, let's start with a default query "type:user" if no q param.

  // Actually, we can just pass 'q' to searchUsers.
  // 'SearchRoot' will default to initial filters.
  // This might cause a mismatch if URL has ?q=... but FilterState is default.
  // Ideally SearchProvider should initialize from URL. Use 'nuqs' or similar?
  // Or manually parse.

  // For this refactor, let's minimize scope creep:
  // We fetch results for the *default* query or provided 'q'.

  // Parse the query string into FilterState
  const initialFilters = parseSearchQuery(q);

  let initialUsersData: {
    users: import("../../lib/user-repository").UserCardData[];
    total_count: number;
    rateLimit?: RateLimit;
  } = {
    users: [],
    total_count: 0,
  };

  try {
    initialUsersData = await searchUsers({
      q: q,
      page: 1,
      per_page: PAGE_SIZE,
      sort: sort,
    });
    console.log(
      "initialUsersData",
      initialUsersData.users.length,
      initialUsersData.total_count,
    );
  } catch (e) {
    console.error("Initial fetch failed", e);
    if (e instanceof GitHubAPIError && e.rateLimit) {
      initialUsersData.rateLimit = e.rateLimit;
    }
  }

  const initialUserNodes = initialUsersData.users.map((user) => (
    <UserCard
      key={user.login}
      user={user}
      className="mx-auto w-full max-w-[360px]"
    />
  ));

  return (
    <SearchProvider
      initialFilters={initialFilters}
      initialSort={sort as SortValue}
    >
      <SearchRoot
        initialUsers={initialUserNodes}
        initialTotalCount={initialUsersData.total_count}
        initialUserIds={initialUsersData.users.map((u) => u.login)}
        initialRateLimit={initialUsersData.rateLimit}
      />
    </SearchProvider>
  );
}
