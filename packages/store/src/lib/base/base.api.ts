import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseAPI = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.example.com",
    // prepareHeaders: (headers, { getState }) => {
    //   const state = getState() as RootState;
    // const token = state.auth?.user?.token;

    // if (token) {
    //   headers.set('authorization', `Bearer ${token}`);
    // }

    // return headers;
    // },
  }),
  tagTypes: [] as string[],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 60,
  endpoints: () => ({}),
});
