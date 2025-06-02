import { apiSlice } from "../api-slice";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: (type) => ({
        url: "get-orders",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    getBuyersForMyCourses: builder.query({
      query: () => ({
        url: "get-all-orders-instructor",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
  }),
});

export const { useGetAllOrdersQuery, useGetBuyersForMyCoursesQuery } = orderApi;
