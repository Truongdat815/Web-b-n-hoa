import { baseApi } from '../baseApi';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => '/carts',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (item) => ({
        url: '/carts/add',
        method: 'POST',
        body: item,
      }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: ({ id, quantity }) => ({
        url: `/carts/${id}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (id) => ({
        url: `/carts/${id}`,
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
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
