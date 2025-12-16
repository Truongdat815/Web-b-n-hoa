import { baseApi } from '../baseApi';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCart: builder.query({
      query: () => '/carts/my-cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (item) => ({
        url: '/carts/add',
        method: 'POST',
        body: {
          flowerId: item.flowerId,
          colorId: item.colorId,
          unitQuantity: item.unitQuantity, // Số lượng bông trong 1 bó
          quantity: item.quantity, // Số lượng bó
        },
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCart: builder.mutation({
      query: ({ cartId, ...data }) => ({
        url: `/carts/update/${cartId}`,
        method: 'PUT',
        body: {
          unitQuantity: data.unitQuantity,
          quantity: data.quantity,
        },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (cartId) => ({
        url: `/carts/delete/${cartId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/carts/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
  }),
});

export const {
  useGetMyCartQuery,
  useAddToCartMutation,
  useUpdateCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
