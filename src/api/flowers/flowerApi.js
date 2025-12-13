import { baseApi } from '../baseApi';

export const flowerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllFlowers: builder.query({
      query: () => '/flowers/all',
      providesTags: ['Flower'],
    }),
    getFlowerById: builder.query({
      query: (id) => `/flowers/${id}`,
      providesTags: ['Flower'],
    }),
    getAllFlowerColors: builder.query({
      query: (params) => ({
        url: '/flower-colors/all',
        params,
      }),
      providesTags: ['Flower', 'Color'],
    }),
    getFlowerColorById: builder.query({
      query: (id) => `/flower-colors/${id}`,
      providesTags: ['Flower', 'Color'],
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
      query: ({ id, ...data }) => ({
        url: `/flowers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Flower'],
    }),
    deleteFlower: builder.mutation({
      query: (id) => ({
        url: `/flowers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Flower'],
    }),
  }),
});

export const {
  useGetAllFlowersQuery,
  useGetFlowerByIdQuery,
  useGetAllFlowerColorsQuery,
  useGetFlowerColorByIdQuery,
  useCreateFlowerMutation,
  useUpdateFlowerMutation,
  useDeleteFlowerMutation,
} = flowerApi;
