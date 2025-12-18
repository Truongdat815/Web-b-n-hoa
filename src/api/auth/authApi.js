import { baseApi } from '../baseApi';

// Helper function to decode JWT token
export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      }),
      transformResponse: (response) => {
        // API returns: { code, message, data: { accessToken, refreshToken, ... } }
        // Return the full response data so LoginPage can process it
        return response;
      },
      invalidatesTags: ['User'],
    }),
    register: build.mutation({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: {
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password,
          phone: payload.phone,
          // Force CUSTOMER role for public self-registration
          // (prevents clients from registering as admin)
          roleId: 0,
        },
      }),
      transformResponse: (response) => response,
    }),
    refreshToken: build.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
    }),
    logout: build.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: build.mutation({
      query: ({ oldPassword, newPassword }) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: { oldPassword, newPassword },
      }),
    }),
    getMe: build.query({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} = authApi;
