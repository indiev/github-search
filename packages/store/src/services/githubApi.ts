import { baseAPI } from "../lib/base/base.api";

export type UserType = "User" | "Organization";

export interface UserStats {
  repositories: number;
  followers: number;
  joined: string;
}

export interface UserCardData {
  login: string;
  name?: string;
  avatarUrl?: string; // Mapped from avatar_url
  type: UserType;
  sponsorable?: boolean;
  stats: UserStats;
  location?: string;
  languages?: string[];
  bio?: string;
  url?: string;
}

export const githubApi = baseAPI.injectEndpoints({
  endpoints: (builder) => ({
    searchUsers: builder.query<
      { users: UserCardData[]; total_count: number },
      {
        q: string;
        page?: number;
        per_page?: number;
        sort?: string;
        order?: string;
      }
    >({
      query: ({ q, page = 1, per_page = 30, sort, order }) => {
        const params: Record<string, string | number> = { q, page, per_page };
        if (sort) params.sort = sort;
        if (order) params.order = order;
        return {
          url: "/api/github/search/users",
          params,
        };
      },
    }),
  }),
});

export const { useSearchUsersQuery, useLazySearchUsersQuery } = githubApi;
