import { baseApi } from '../baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/users/create',
        method: 'POST',
        body: {
          fullName: userData.fullName,
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
          roleId: userData.roleId, // 1: Admin, 2: Customer
        },
      }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    getUserByName: builder.query({
      query: (name) => `/users/name/${encodeURIComponent(name)}`,
      providesTags: ['User'],
    }),
    getUserById: builder.query({
      query: (userId) => `/users/${userId}`,
      providesTags: ['User'],
    }),
    getAllUsers: builder.query({
      query: () => '/users/all',
      providesTags: ['User'],
    }),
    updateUser: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: `/users/update/${userId}`,
        method: 'PUT',
        body: {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
        },
      }),
      invalidatesTags: ['User'],
    }),
    updateUserStatus: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/status`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `/users/delete/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetMeQuery,
  useGetUserByNameQuery,
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = userApi;

