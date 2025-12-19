import { baseApi } from '../baseApi';

export const flowerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFlowers: builder.query({
      query: () => '/flowers/all',
      providesTags: ['Flower'],
    }),
    getFlowerByName: builder.query({
      query: (name) => `/flowers/name/${encodeURIComponent(name)}`,
      providesTags: ['Flower'],
    }),
    getFlowerById: builder.query({
      query: (flowerId) => `/flowers/${flowerId}`,
      providesTags: ['Flower'],
    }),
    createFlower: builder.mutation({
      query: (flowerData) => ({
        url: '/flowers/create',
        method: 'POST',
        body: {
          flowerName: flowerData.flowerName,
          unitPrice: flowerData.unitPrice,
          description: flowerData.description,
          quantityInStock: flowerData.quantityInStock,
        },
      }),
      invalidatesTags: ['Flower'],
    }),
    updateFlower: builder.mutation({
      query: ({ flowerId, ...data }) => ({
        url: `/flowers/update/${flowerId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Flower'],
    }),
    deleteFlower: builder.mutation({
      query: (flowerId) => ({
        url: `/flowers/delete/${flowerId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Flower'],
    }),
    uploadFlowerImage: builder.mutation({
      query: ({ flowerId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/flowers/${flowerId}/upload-image`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['Flower'],
    }),
  }),
});

export const {
  useGetAllFlowersQuery,
  useGetFlowerByNameQuery,
  useLazyGetFlowerByNameQuery,
  useGetFlowerByIdQuery,
  useCreateFlowerMutation,
  useUpdateFlowerMutation,
  useDeleteFlowerMutation,
  useUploadFlowerImageMutation,
} = flowerApi;
