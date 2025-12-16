import { baseApi } from '../baseApi';

export const flowerColorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFlowerColors: builder.query({
      query: () => '/flower-colors/all',
      providesTags: ['FlowerColor'],
    }),
    createFlowerColor: builder.mutation({
      query: (data) => ({
        url: '/flower-colors/create',
        method: 'POST',
        body: {
          flowerId: data.flowerId,
          colorId: data.colorId,
          unitPrice: data.unitPrice,
          quantityInStock: data.quantityInStock,
        },
      }),
      invalidatesTags: ['FlowerColor'],
    }),
    uploadFlowerColorImage: builder.mutation({
      query: ({ flowerId, colorId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/flower-colors/${flowerId}/${colorId}/upload-flower-color-image`,
          method: 'POST',
          body: formData,
          // Don't set Content-Type, browser will set it with boundary
        };
      },
      invalidatesTags: ['FlowerColor'],
    }),
    updateUnitPrice: builder.mutation({
      query: ({ flowerColorId, unitPrice }) => ({
        url: `/flower-colors/${flowerColorId}/unit-price`,
        method: 'PUT',
        body: { unitPrice },
      }),
      invalidatesTags: ['FlowerColor'],
    }),
    updateQuantity: builder.mutation({
      query: ({ flowerColorId, quantityInStock }) => ({
        url: `/flower-colors/${flowerColorId}/quantity`,
        method: 'PUT',
        body: { quantityInStock },
      }),
      invalidatesTags: ['FlowerColor'],
    }),
    updateFlowerColor: builder.mutation({
      query: ({ flowerColorId, ...data }) => ({
        url: `/flower-colors/update/${flowerColorId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['FlowerColor'],
    }),
    deleteFlowerColor: builder.mutation({
      query: (flowerColorId) => ({
        url: `/flower-colors/delete/${flowerColorId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FlowerColor'],
    }),
  }),
});

export const {
  useGetAllFlowerColorsQuery,
  useCreateFlowerColorMutation,
  useUploadFlowerColorImageMutation,
  useUpdateUnitPriceMutation,
  useUpdateQuantityMutation,
  useUpdateFlowerColorMutation,
  useDeleteFlowerColorMutation,
} = flowerColorApi;

