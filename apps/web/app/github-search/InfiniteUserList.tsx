"use client";

import {
  useState,
  useTransition,
  useRef,
  useEffect,
  type ReactNode,
} from "react";

import {
  useLazySearchUsersQuery,
  useAppSelector,
  selectRateLimit,
} from "@repo/store";
import InfiniteScrollContainer from "@repo/ui/components/InfiniteScrollContainer";
import UserCard from "@repo/ui/components/UserCard";
import UserCardSkeleton from "@repo/ui/components/UserCardSkeleton";
import Box from "@repo/ui/primitives/Box";
import Typography from "@repo/ui/primitives/Typography";

import { PAGE_SIZE } from "./constants";
import { buildSearchQuery } from "./filterUtils";
import { useSearchContext } from "./SearchContext";
import { useRateLimitAutoRetry } from "../../hooks/useRateLimitAutoRetry";

export interface InfiniteUserListProps {
  initialUsers: ReactNode[];
  initialTotalCount?: number;
  initialUserIds: string[];
  onTotalCountChange?: (count: number) => void;
}

export default function InfiniteUserList({
  initialUsers,
  initialTotalCount,
  initialUserIds,
  onTotalCountChange,
}: InfiniteUserListProps) {
  const [users, setUsers] = useState<ReactNode[]>(initialUsers);
  // If we start with users, next page is 2. If we start empty (client filter update), start at 1.
  const [page, setPage] = useState(initialUsers.length > 0 ? 2 : 1);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [isPending, startTransition] = useTransition();

  // Use a Ref to track loaded IDs to prevent re-renders on ID checks
  const loadedIdsRef = useRef<Set<string>>(new Set(initialUserIds));

  const { filters, sort } = useSearchContext();

  // RTK Query Hook
  const [trigger, result] = useLazySearchUsersQuery();
  const { isFetching } = result;
  const [fetchError, setFetchError] = useState<string | null>(null);

  const rateLimit = useAppSelector(selectRateLimit);

  const shouldFetchInitial = users.length === 0 && page === 1;

  useEffect(() => {
    if (shouldFetchInitial) {
      // Trigger fetch immediately
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchInitial]);

  const hasMore = users.length < (totalCount || 0) || shouldFetchInitial;

  console.log("InfiniteUserList Render:", {
    usersLen: users.length,
    totalCount,
    hasMore,
    isFetching,
    isPending,
    shouldFetchInitial,
  });
  // Track which page is currently being/has just been fetched to prevent duplicates
  // for the same page before state updates.
  const loadingPageRef = useRef<number | null>(null);

  const loadMore = async () => {
    // Block if we are currently loading this EXACT page
    if (loadingPageRef.current === page) {
      return;
    }

    if (isPending || isFetching) {
      return;
    }
    if (rateLimit?.isLimited) {
      return;
    }
    if (!hasMore && !shouldFetchInitial) {
      return;
    }

    setFetchError(null);
    loadingPageRef.current = page;

    startTransition(async () => {
      try {
        const q = buildSearchQuery(filters);

        const queryParams = {
          q: q || "type:user",
          page,
          per_page: PAGE_SIZE,
          sort: sort === "default" ? undefined : sort,
        };

        const data = await trigger(queryParams).unwrap();

        if (data.total_count !== undefined) {
          setTotalCount(data.total_count);
          if (onTotalCountChange) {
            onTotalCountChange(data.total_count);
          }
        }

        const newUsers = data.users || [];
        const uniqueUsers = newUsers.filter((user) => {
          if (loadedIdsRef.current.has(user.login)) {
            return false;
          }
          loadedIdsRef.current.add(user.login);
          return true;
        });

        if (uniqueUsers.length > 0) {
          const userNodes = uniqueUsers.map((user) => (
            <UserCard key={user.login} user={user} className="mx-auto w-full" />
          ));
          setUsers((prev) => [...prev, ...userNodes]);
        }

        setPage((prev) => prev + 1);
      } catch (error) {
        // If failed, reset loadingRef so we can try again for this page
        loadingPageRef.current = null;

        const err = error as {
          status?: number;
          data?: { message?: string };
          message?: string;
        };

        if (err.status === 429 || err.status === 403) {
          console.warn("Requests rate limited (403/429). Waiting for reset...");
          return;
        }

        console.error(
          "Failed to load more users:",
          JSON.stringify(err, null, 2),
        );
        setFetchError(
          err.data?.message || err.message || "Failed to load more users",
        );
      }
    });
  };

  useRateLimitAutoRetry(loadMore);

  const loader = (
    <Box className="space-y-3">
      <UserCardSkeleton />
      <UserCardSkeleton />
    </Box>
  );

  const errorContent = fetchError ? (
    <Box className="py-4 text-center">
      <Typography color="error" className="mb-2">
        {fetchError}
      </Typography>
      <button
        onClick={loadMore}
        className="text-sm text-blue-500 underline hover:text-blue-700"
      >
        다시 시도
      </button>
    </Box>
  ) : null;

  return (
    <InfiniteScrollContainer
      hasMore={hasMore}
      isLoading={isPending || isFetching}
      onLoadMore={loadMore}
      loader={loader}
      endMessage={
        users.length > 0 ? (
          <Typography className="text-center" color="text.secondary">
            모든 결과를 확인했습니다.
          </Typography>
        ) : null
      }
      className="gap-5"
    >
      <Box className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {users}
      </Box>
      {users.length === 0 && !isPending && !isFetching && fetchError && (
        <Box className="flex flex-col items-center justify-center py-12 text-center">
          <Typography color="error" className="mb-2 text-lg font-medium">
            {fetchError}
          </Typography>
          <Typography color="text.secondary" className="mb-4">
            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
          </Typography>
          <button
            onClick={loadMore}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            다시 시도
          </button>
        </Box>
      )}
      {users.length === 0 && !isPending && !isFetching && !fetchError && (
        <Box className="flex flex-col items-center justify-center py-12 text-center">
          <Typography className="mb-2 text-lg font-medium text-(--color-text-primary)">
            검색 결과가 없습니다
          </Typography>
          <Typography className="text-(--color-text-secondary)">
            다른 검색어로 시도해보세요.
          </Typography>
        </Box>
      )}
      {errorContent}
    </InfiniteScrollContainer>
  );
}
