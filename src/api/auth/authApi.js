import { baseApi } from '../baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    register: build.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    getMe: build.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    logout: build.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
