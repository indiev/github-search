import { createApi } from "@reduxjs/toolkit/query/react";

import { baseQueryWithRateLimit } from "./baseQueryWithRateLimit";

export const baseAPI = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithRateLimit,
  tagTypes: [] as string[],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 60,
  endpoints: () => ({}),
});
