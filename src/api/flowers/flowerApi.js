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
    createFlower: builder.mutation({
      query: (flowerData) => ({
        url: '/flowers/create',
        method: 'POST',
        body: flowerData,
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
  }),
});

export const {
  useGetAllFlowersQuery,
  useGetFlowerByNameQuery,
  useLazyGetFlowerByNameQuery,
  useCreateFlowerMutation,
  useUpdateFlowerMutation,
  useDeleteFlowerMutation,
} = flowerApi;
