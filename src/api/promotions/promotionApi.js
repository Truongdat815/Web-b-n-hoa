import { baseApi } from '../baseApi';

export const promotionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPromotion: builder.mutation({
      query: (data) => ({
        url: '/promotions/create',
        method: 'POST',
        body: {
          flowerColorId: data.flowerColorId,
          discountPercent: data.discountPercent,
          startDate: data.startDate, // ISO date string
          endDate: data.endDate, // ISO date string
          description: data.description,
        },
      }),
      invalidatesTags: ['Promotion'],
    }),
    getPromotionsByFlower: builder.query({
      query: (flowerId) => `/promotions/flower/${flowerId}`,
      providesTags: ['Promotion'],
    }),
    getActivePromotionByFlowerColor: builder.query({
      query: (flowerColorId) => `/promotions/flower-color/${flowerColorId}/active`,
      providesTags: ['Promotion'],
    }),
    getActivePromotions: builder.query({
      query: () => '/promotions/active',
      providesTags: ['Promotion'],
    }),
    getInactivePromotions: builder.query({
      query: () => '/promotions/inactive',
      providesTags: ['Promotion'],
    }),
    getAllPromotions: builder.query({
      query: () => '/promotions/all',
      providesTags: ['Promotion'],
    }),
    updatePromotion: builder.mutation({
      query: ({ promotionId, ...data }) => ({
        url: `/promotions/update/${promotionId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Promotion'],
    }),
    togglePromotionStatus: builder.mutation({
      query: (promotionId) => ({
        url: `/promotions/${promotionId}/updateStatus`,
        method: 'PUT',
      }),
      invalidatesTags: ['Promotion'],
    }),
    deletePromotion: builder.mutation({
      query: (promotionId) => ({
        url: `/promotions/delete/${promotionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Promotion'],
    }),
  }),
});

export const {
  useCreatePromotionMutation,
  useGetPromotionsByFlowerQuery,
  useGetActivePromotionByFlowerColorQuery,
  useGetActivePromotionsQuery,
  useGetInactivePromotionsQuery,
  useGetAllPromotionsQuery,
  useUpdatePromotionMutation,
  useTogglePromotionStatusMutation,
  useDeletePromotionMutation,
} = promotionApi;

