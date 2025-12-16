import { baseApi } from '../baseApi';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllOrders: builder.query({
      query: () => '/orders/admin/all',
      providesTags: ['Order'],
    }),
    getOrdersByCustomer: builder.query({
      query: (customerId) => `/orders/admin/customer/${customerId}`,
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
        body: {
          cartIds: orderData.cartIds,
          promotionId: orderData.promotionId,
          recipientName: orderData.recipientName,
          recipientPhone: orderData.recipientPhone,
          recipientAddress: orderData.recipientAddress,
          note: orderData.note,
          shippingFee: orderData.shippingFee,
        },
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrdersByCustomerQuery,
  useGetOrderByIdQuery,
  useGetMyOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = orderApi;
