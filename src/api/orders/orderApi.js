import { baseApi } from '../baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: () => '/orders/all',
      providesTags: ['Order'],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: ['Order'],
    }),
    getMyOrders: builder.query({
      query: () => '/orders/my-orders',
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders/create',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useGetMyOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = orderApi;
