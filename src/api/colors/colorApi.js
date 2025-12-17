import { baseApi } from '../baseApi';

// Color endpoints (used for selecting a color when creating a FlowerColor)
export const colorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllColors: builder.query({
      query: () => '/colors/all',
      providesTags: ['Color'],
    }),
    getColorById: builder.query({
      query: (id) => `/colors/${id}`,
      providesTags: ['Color'],
    }),
  }),
});

export const { useGetAllColorsQuery, useGetColorByIdQuery } = colorApi;


