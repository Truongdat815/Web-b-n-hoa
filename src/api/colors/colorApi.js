import { baseApi } from '../baseApi';

// Color endpoints (used for selecting a color when creating a FlowerColor)
export const colorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllColors: builder.query({
      query: () => '/colors/all',
      providesTags: ['Color'],
    }),
    createColor: builder.mutation({
      query: (payload) => ({
        url: '/colors/create',
        method: 'POST',
        body: {
          colorName: payload.colorName,
          colorCode: payload.colorCode,
        },
      }),
      invalidatesTags: ['Color'],
    }),
    getColorById: builder.query({
      query: (id) => `/colors/${id}`,
      providesTags: ['Color'],
    }),
  }),
});

export const { useGetAllColorsQuery, useCreateColorMutation, useGetColorByIdQuery } = colorApi;


