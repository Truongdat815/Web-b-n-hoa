import { baseApi } from '../baseApi';

export const promotionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPromotion: builder.mutation({
      query: (data) => ({
        url: '/promotions/create',
        method: 'POST',
        body: {
          flowerId: data.flowerId || 0,
          promotionName: data.promotionName,
          description: data.description || '',
          promotionType: data.promotionType || 'PERCENTAGE',
          amount: data.amount,
          startDate: data.startDate, // ISO date string
          endDate: data.endDate, // ISO date string
          forAll: data.forAll || false,
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
    getActivePromotionsByFlower: builder.query({
      query: (flowerId) => `/promotions/flower/${flowerId}/active`,
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
  useGetActivePromotionsByFlowerQuery,
  useGetActivePromotionsQuery,
  useGetInactivePromotionsQuery,
  useGetAllPromotionsQuery,
  useUpdatePromotionMutation,
  useTogglePromotionStatusMutation,
  useDeletePromotionMutation,
} = promotionApi;

