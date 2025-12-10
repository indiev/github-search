"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { buildInitialFilterState } from "./filterUtils";

import type { FilterState, SortValue } from "./types";

interface SearchContextValue {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  sort: SortValue;
  setSort: (sort: SortValue) => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

const FILTERS_STORAGE_KEY = "github-search:filters";
const SORT_STORAGE_KEY = "github-search:sort";

export function SearchProvider({
  children,
  initialFilters,
  initialSort,
}: {
  children: ReactNode;
  initialFilters?: FilterState;
  initialSort?: SortValue;
}) {
  const [filters, setFilters] = useState<FilterState>(() => {
    if (initialFilters) {
      return initialFilters;
    }

    if (typeof window !== "undefined") {
      try {
        const stored = window.sessionStorage.getItem(FILTERS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as FilterState;
          return parsed;
        }
      } catch {
        // Ignore storage errors and fall back to default filters
      }
    }

    return buildInitialFilterState();
  });

  const [sort, setSort] = useState<SortValue>(() => {
    if (initialSort !== undefined) {
      return initialSort;
    }

    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem(SORT_STORAGE_KEY);
      if (
        stored === "default" ||
        stored === "followers" ||
        stored === "repositories" ||
        stored === "joined"
      ) {
        return stored;
      }
    }

    return "default";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.sessionStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify(filters),
      );
      window.sessionStorage.setItem(SORT_STORAGE_KEY, sort);
    } catch {
      // Ignore storage write errors to avoid breaking the UI
    }
  }, [filters, sort]);

  return (
    <SearchContext.Provider value={{ filters, setFilters, sort, setSort }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
}
