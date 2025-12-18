import { baseApi } from '../baseApi';

export const recipientInfoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRecipientInfos: builder.query({
      query: () => '/recipient-infos/all',
      providesTags: ['RecipientInfo'],
    }),
    createRecipientInfo: builder.mutation({
      query: (data) => ({
        url: '/recipient-infos/create',
        method: 'POST',
        body: {
          recipientName: data.recipientName,
          recipientPhone: data.recipientPhone,
          recipientAddress: data.recipientAddress,
          isDefault: data.isDefault || false,
        },
      }),
      invalidatesTags: ['RecipientInfo'],
    }),
    updateRecipientInfo: builder.mutation({
      query: ({ infoId, ...data }) => ({
        url: `/recipient-infos/update/${infoId}`,
        method: 'PUT',
        body: {
          recipientName: data.recipientName,
          recipientPhone: data.recipientPhone,
          recipientAddress: data.recipientAddress,
          isDefault: data.isDefault || false,
        },
      }),
      invalidatesTags: ['RecipientInfo'],
    }),
  }),
});

export const {
  useGetAllRecipientInfosQuery,
  useCreateRecipientInfoMutation,
  useUpdateRecipientInfoMutation,
} = recipientInfoApi;

