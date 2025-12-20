import { baseApi } from '../baseApi';

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tạo feedback mới
    createFeedback: builder.mutation({
      query: (feedbackData) => ({
        url: '/feedbacks/create',
        method: 'POST',
        body: {
          orderDetailId: feedbackData.orderDetailId,
          rating: feedbackData.rating,
          content: feedbackData.content,
        },
      }),
      invalidatesTags: ['Feedback'],
    }),

    // Lấy feedback theo ID
    getFeedbackById: builder.query({
      query: (feedbackId) => `/feedbacks/${feedbackId}`,
      providesTags: ['Feedback'],
    }),

    // Cập nhật feedback
    updateFeedback: builder.mutation({
      query: ({ feedbackId, ...data }) => ({
        url: `/feedbacks/${feedbackId}`,
        method: 'PUT',
        body: {
          rating: data.rating,
          content: data.content,
        },
      }),
      invalidatesTags: ['Feedback'],
    }),

    // Xóa feedback
    deleteFeedback: builder.mutation({
      query: (feedbackId) => ({
        url: `/feedbacks/${feedbackId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Feedback'],
    }),

    // Lấy feedback theo order detail ID
    getFeedbacksByOrderDetail: builder.query({
      query: (orderDetailId) => `/feedbacks/order-detail/${orderDetailId}`,
      providesTags: ['Feedback'],
    }),

    // Lấy tất cả feedback của một order
    getFeedbacksByOrder: builder.query({
      query: (orderId) => `/feedbacks/order/${orderId}`,
      providesTags: ['Feedback'],
    }),

    // Lấy feedback của user hiện tại
    getMyFeedbacks: builder.query({
      query: () => '/feedbacks/my-feedbacks',
      providesTags: ['Feedback'],
    }),

    // Lấy feedback của một sản phẩm (flower)
    getFeedbacksByFlower: builder.query({
      query: (flowerId) => `/feedbacks/flower/${flowerId}`,
      providesTags: ['Feedback'],
    }),

    // Lấy tất cả feedback (admin only)
    getAllFeedbacks: builder.query({
      query: () => '/feedbacks/admin/all',
      providesTags: ['Feedback'],
    }),
  }),
});

export const {
  useCreateFeedbackMutation,
  useGetFeedbackByIdQuery,
  useUpdateFeedbackMutation,
  useDeleteFeedbackMutation,
  useGetFeedbacksByOrderDetailQuery,
  useGetFeedbacksByOrderQuery,
  useGetMyFeedbacksQuery,
  useGetFeedbacksByFlowerQuery,
  useGetAllFeedbacksQuery,
} = feedbackApi;

