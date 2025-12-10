"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  useAppDispatch,
  rateLimitUpdated,
  retryCleared,
  type RateLimitInfo,
} from "@repo/store";
import FilterSummaryChips from "@repo/ui/components/FilterSummaryChips";
import ModeSwitch from "@repo/ui/components/ModeSwitch";
import SortBar from "@repo/ui/components/SortBar";
import AppShell from "@repo/ui/layouts/AppShell";
import PageHeader from "@repo/ui/layouts/PageHeader";
import SidebarLayout from "@repo/ui/layouts/SidebarLayout";
import Box from "@repo/ui/primitives/Box";
import Button from "@repo/ui/primitives/Button";
import Chip from "@repo/ui/primitives/Chip";
import Typography from "@repo/ui/primitives/Typography";

import {
  JOINED_DATE_PRESETS,
  LANGUAGE_OPTIONS,
  LOCATION_OPTIONS,
} from "./constants";
import FilterPanel from "./FilterPanel";
import {
  buildFilterSummaryEntries,
  buildInitialFilterState,
  createEmptyNumberRange,
} from "./filterUtils";
import InfiniteUserList from "./InfiniteUserList";
import { useSearchContext } from "./SearchContext";
import RateLimitBanner from "../components/RateLimitBanner";
import RateLimitIndicator from "../components/RateLimitIndicator";

import type { FilterSummaryEntry } from "./filterUtils";
import type { SortValue, RateLimit } from "./types";

const sortOptions = [
  { value: "default", label: "기본" },
  { value: "followers", label: "Followers" },
  { value: "repositories", label: "Repositories" },
  { value: "joined", label: "Joined" },
];

interface SearchRootProps {
  initialUsers: ReactNode[];
  initialTotalCount: number;
  initialUserIds: string[];
  initialRateLimit?: RateLimit;
}

export default function SearchRoot({
  initialUsers,
  initialTotalCount,
  initialUserIds,
  initialRateLimit,
}: SearchRootProps) {
  const dispatch = useAppDispatch();
  const { filters, setFilters, sort, setSort } = useSearchContext();

  // "Draft" filters State (For FilterPanel)
  // This lives here to survive FilterPanel being unmounted by SidebarLayout
  const [draftFilters, setDraftFilters] = useState(filters);

  // Sync draft filters when context filters change (e.g. Reset, or initial load)
  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const filterToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const interactionRef = useRef(true);

  // Dispatch initial rate limit to Redux
  useEffect(() => {
    if (initialRateLimit) {
      const info: RateLimitInfo = {
        resource: "search", // Assume search for initial page
        limit: initialRateLimit.limit,
        remaining: initialRateLimit.remaining,
        used: initialRateLimit.used,
        resetAt: null, // We might not have this from initial props if it's epoch
        resetEpochSeconds: initialRateLimit.reset,
        retryAfterSeconds: null,
        isLimited: initialRateLimit.remaining === 0,
        source: "header",
      };
      // Convert epoch to ISO for consistency if needed, checking reset
      if (initialRateLimit.reset) {
        info.resetAt = new Date(initialRateLimit.reset * 1000).toISOString();
      }
      dispatch(rateLimitUpdated(info));
    }
  }, [initialRateLimit, dispatch]);

  // Use state to manage initialUsers. We only want them on first load.
  // After mount, we clear them so future re-mounts of InfiniteUserList (due to filter change) start empty.
  const [initialUsersState, setInitialUsersState] = useState(initialUsers);

  useEffect(() => {
    // Clear initial users after first render cycle
    setInitialUsersState([]);
  }, []);

  const [showFilterFeedback, setShowFilterFeedback] = useState(false);

  // Feedback toast logic
  useEffect(() => {
    if (interactionRef.current) {
      interactionRef.current = false;
      return;
    }

    setShowFilterFeedback(true);
    const timeout = setTimeout(() => {
      setShowFilterFeedback(false);
      filterToastTimerRef.current = null;
    }, 1500);
    filterToastTimerRef.current = timeout;

    return () => {
      clearTimeout(timeout);
    };
  }, [filters, sort]);

  useEffect(() => {
    return () => {
      if (filterToastTimerRef.current) {
        clearTimeout(filterToastTimerRef.current);
      }
    };
  }, []);

  const [totalCount, setTotalCount] = useState(initialTotalCount);

  // Update total count if initial props change (e.g. navigation)
  useEffect(() => {
    setTotalCount(initialTotalCount);
  }, [initialTotalCount]);

  const handleResetFilters = () => {
    setFilters(buildInitialFilterState());
  };

  const handleRemoveFilter = (entry: FilterSummaryEntry) => {
    setFilters(
      ((prev) => {
        switch (entry.category) {
          case "type":
            return { ...prev, type: "user" };
          case "sponsorable":
            return { ...prev, sponsorableOnly: false };
          case "text":
            return { ...prev, text: "" };
          case "repoCount":
            return { ...prev, repoCount: createEmptyNumberRange() };
          case "followers":
            return { ...prev, followerCount: createEmptyNumberRange() };
          case "joined":
            return { ...prev, joined: { preset: "any" } };
          case "location":
            return {
              ...prev,
              locations: prev.locations.filter(
                (location) => location !== entry.value,
              ),
            };
          case "language":
            return {
              ...prev,
              languages: prev.languages.filter(
                (language) => language !== entry.value,
              ),
            };
          default:
            return prev;
        }
      })(filters),
    );
  };

  const summaryEntries = useMemo(
    () => buildFilterSummaryEntries(filters),
    [filters],
  );

  const hasActiveFilters = summaryEntries.length > 0;

  const summaryChips = summaryEntries.map((entry) => ({
    key: entry.key,
    label: entry.label,
    onRemove: () => handleRemoveFilter(entry),
  }));

  const sortMetaLabel = `총 ${totalCount}명${
    hasActiveFilters ? " (필터 적용됨)" : ""
  }`;

  return (
    <AppShell
      maxWidthClassName="max-w-7xl"
      header={
        <PageHeader
          title="GitHub 사용자 검색"
          description="필터와 정렬만으로 다양한 GitHub 계정을 탐색할 수 있습니다."
          status={<RateLimitIndicator />}
          actions={
            <Box className="flex flex-col gap-3 text-right lg:flex-row lg:items-center lg:justify-end">
              <ModeSwitch />
            </Box>
          }
        />
      }
    >
      <SidebarLayout
        sidebar={
          <FilterPanel
            value={draftFilters}
            onChange={setDraftFilters}
            onApply={() => {
              console.log("SearchRoot: onApply called", draftFilters);
              dispatch(retryCleared());
              setFilters(draftFilters);
            }}
            onReset={handleResetFilters}
            languageOptions={LANGUAGE_OPTIONS}
            locationOptions={LOCATION_OPTIONS}
            joinedPresets={JOINED_DATE_PRESETS}
          />
        }
        drawerTitle="필터"
        toggleLabel="필터 열기"
      >
        <Box className="space-y-6">
          <FilterSummaryChips
            chips={summaryChips}
            onReset={handleResetFilters}
            resetLabel="필터 초기화"
          />
          {showFilterFeedback ? (
            <Box className="flex justify-end">
              <Chip label="필터 적용됨" color="primary" size="small" />
            </Box>
          ) : null}
          <SortBar
            value={sort}
            options={sortOptions}
            onChange={(val) => {
              console.log("SearchRoot: sort changed", val);
              setSort(val as SortValue);
            }}
            resultCount={totalCount}
            metaLabel={sortMetaLabel}
          />

          <RateLimitBanner onManualRetry={() => {}} />

          <Box>
            {totalCount === 0 &&
            !hasActiveFilters &&
            initialTotalCount === 0 ? (
              <EmptyState onReset={handleResetFilters} />
            ) : (
              // Key forces remount when filters/sort change, resetting the list
              // This is simpler than sync logic inside InfiniteUserList
              <InfiniteUserList
                key={JSON.stringify(filters) + sort}
                initialUsers={initialUsersState}
                initialTotalCount={
                  initialUsersState.length > 0 ? initialTotalCount : 0
                }
                initialUserIds={
                  initialUsersState.length > 0 ? initialUserIds : []
                }
                onTotalCountChange={setTotalCount}
              />
            )}
          </Box>
        </Box>
      </SidebarLayout>
    </AppShell>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Box className="rounded-3xl border border-dashed border-black/10 bg-(--color-background-paper) p-10 text-center dark:border-white/20">
      <Typography variant="h6" component="p">
        조건을 만족하는 사용자가 없습니다.
      </Typography>
      <Typography variant="body2" color="text.secondary" className="mt-2">
        필터를 조정하거나 초기화해보세요.
      </Typography>
      <Button variant="outlined" className="mt-4" onClick={onReset}>
        필터 초기화
      </Button>
    </Box>
  );
}
