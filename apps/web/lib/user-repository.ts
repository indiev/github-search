import "server-only";
import { z } from "zod";

import { type UserCardData } from "@repo/ui/components/UserCard";
export type { UserCardData };

import {
  fetchWithRetry,
  GITHUB_API_BASE,
  parseRateLimitHeaders,
  type RateLimit,
  sleep,
} from "./api-client";

// Validates the UserType field from API, defaulting to "User" if unknown
const UserTypeSchema = z.enum(["User", "Organization"]).catch("User");

export type UserType = z.infer<typeof UserTypeSchema>;

// Schema for an item in the search results
const SearchResponseItemSchema = z.object({
  login: z.string(),
  name: z.string().nullable().optional(),
  avatar_url: z.string(),
  type: UserTypeSchema,
  public_repos: z.number().optional(),
  followers: z.number().optional(),
  created_at: z.string().optional(),
  location: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  html_url: z.string(),
  url: z.string(),
});

// Schema for the full search response
const SearchResponseSchema = z.object({
  total_count: z.number(),
  incomplete_results: z.boolean(),
  items: z.array(SearchResponseItemSchema),
});

type SearchResponseItem = z.infer<typeof SearchResponseItemSchema>;

export interface SearchUsersParams {
  q: string;
  page?: number | string;
  per_page?: number | string;
  sort?: string;
  order?: string;
}

export async function searchUsers({
  q,
  page = 1,
  per_page = 30,
  sort,
  order,
}: SearchUsersParams): Promise<{
  users: UserCardData[];
  total_count: number;
  rateLimit?: RateLimit;
}> {
  if (!q) {
    throw new Error("Query parameter 'q' is required");
  }

  // Mock API for E2E testing to avoid rate limits
  if (process.env.MOCK_GITHUB_API === "true") {
    if (q.includes("emptyresult")) {
      return {
        users: [],
        total_count: 0,
        rateLimit: {
          limit: 5000,
          remaining: 4999,
          reset: Math.floor(Date.now() / 1000) + 3600,
          used: 1,
        },
      };
    }
    return {
      users: [
        {
          login: "test-user-1",
          type: "User",
          avatarUrl: "https://avatars.githubusercontent.com/u/1001?v=4",
          url: "https://github.com/test-user-1",
          name: "Test User One",
          stats: {
            repositories: 10,
            followers: 100,
            joined: "2020-01-01T12:00:00Z",
          },
        },
        {
          login: "test-user-2",
          type: "User",
          avatarUrl: "https://avatars.githubusercontent.com/u/1002?v=4",
          url: "https://github.com/test-user-2",
          name: "Test User Two",
          stats: {
            repositories: 5,
            followers: 50,
            joined: "2021-05-20T10:00:00Z",
          },
        },
        {
          login: "test-user-3",
          type: "User",
          avatarUrl: "https://avatars.githubusercontent.com/u/1003?v=4",
          url: "https://github.com/test-user-3",
          name: "Test User Three",
          stats: {
            repositories: 20,
            followers: 200,
            joined: "2019-11-15T08:30:00Z",
          },
        },
      ],
      total_count: 35,
      rateLimit: {
        limit: 5000,
        remaining: 4999,
        reset: Math.floor(Date.now() / 1000) + 3600,
        used: 1,
      },
    };
  }

  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Build query string
  const searchParams = new URLSearchParams({
    q,
    page: String(page),
    per_page: String(per_page),
  });

  if (sort) searchParams.append("sort", sort);
  if (order) searchParams.append("order", order);

  try {
    const response = await fetchWithRetry(
      `${GITHUB_API_BASE}/search/users?${searchParams.toString()}`,
      {
        headers,
        cache: "no-store",
      },
    );

    const rateLimit = parseRateLimitHeaders(response.headers);

    const rawData = await response.json();
    // Validate response structure using Zod
    const data = SearchResponseSchema.parse(rawData);

    const items = data.items || [];

    // Concurrency control for detail fetching
    // Fetch user details in batches to avoid triggering rate limits
    const BATCH_SIZE = 5;
    const detailedItems: SearchResponseItem[] = [];

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          try {
            // Check cache or fetch
            // We use simple fetch here, maybe without retry to avoid slowing down too much
            // if detail fetch fails, we fallback to item
            const detailResponse = await fetch(item.url, {
              headers,
              next: { revalidate: 60 * 60 * 24 }, // Cache user details for 24 hours
            });
            if (!detailResponse.ok) return item;

            // Allow loose parsing for details as they might have extra fields or slight variations
            // but we want to ensure we at least get the basics compatible with our schema
            const detailJson = await detailResponse.json();
            const parsedDetail = SearchResponseItemSchema.safeParse(detailJson);

            return parsedDetail.success ? parsedDetail.data : item;
          } catch {
            return item;
          }
        }),
      );
      detailedItems.push(...batchResults);
      // Small delay between batches to be nice
      if (i + BATCH_SIZE < items.length) {
        await sleep(100);
      }
    }

    const users: UserCardData[] = detailedItems.map((item) => {
      // Map to UserCardData (Domain Entity)
      // Zod has already validated that 'item' conforms to SearchResponseItemSchema structure
      // or at least compatible subsets if it was a detail fetch fallback
      const bio = item.bio ?? undefined;
      const location = item.location ?? undefined;
      const name = item.name ?? undefined;

      return {
        login: item.login,
        name: name,
        avatarUrl: item.avatar_url,
        type: item.type as UserType, // Schema ensures this is "User" or "Organization"
        sponsorable: false,
        stats: {
          repositories: item.public_repos ?? 0,
          followers: item.followers ?? 0,
          joined: item.created_at ?? "2000-01-01T00:00:00Z",
        },
        location: location,
        bio: bio,
        url: item.html_url,
        languages: [], // GitHub Search API doesn't return languages, requires separate repo fetch
      };
    });

    return { users, total_count: data.total_count, rateLimit };
  } catch (error) {
    console.error("searchUsers failed:", error);
    throw error;
  }
}
