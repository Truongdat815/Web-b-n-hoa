import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use environment variable for API URL, fallback to '/api' for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://160.25.232.214:8080/api';

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    // Don't set Content-Type for FormData (file uploads)
    // The browser will automatically set it with boundary
    if (!endpoint?.includes('upload')) {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

// Refresh token function
const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (data.code === 200 && data.data) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      return data.data.accessToken;
    }
  } catch (error) {
    console.error('Refresh token failed:', error);
  }
  return null;
};

// Custom baseQuery with error handling and auto refresh token
const baseQuery = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);
  
  // Handle 401 Unauthorized - try to refresh token
  // Only do this if:
  // 1. We have a token in state (user was logged in)
  // 2. We're not on login/register page
  // 3. The endpoint is not login/refresh (these don't need auth)
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath === '/login' || currentPath === '/register';
  const isAuthEndpoint = args?.url?.includes('/auth/login') || args?.url?.includes('/auth/refresh');
  const hasToken = api.getState().auth.token || localStorage.getItem('accessToken');
  
  if (result.error && result.error.status === 401) {
    // If we have a token, try to refresh it
    if (hasToken && !isAuthPage && !isAuthEndpoint) {
      const newToken = await refreshToken();
      if (newToken) {
        // Update Redux store with new token
        api.dispatch({
          type: 'auth/setCredentials',
          payload: {
            token: newToken,
            user: api.getState().auth.user,
            role: api.getState().auth.role,
          },
        });
        // Retry the original request with new token
        result = await baseQueryWithAuth(args, api, extraOptions);
      } else {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (currentPath !== '/login') {
          window.location.href = '/login';
        }
        return {
          error: {
            status: 401,
            data: { message: 'Phiên đăng nhập đã hết hạn' },
          },
        };
      }
    }
    // If no token and on auth page, just return the error normally (don't show "session expired")
    // This is normal for login/register endpoints when user hasn't logged in yet
  }
  
  // Handle API response format: { code, message, data }
  if (result.data) {
    // If response has code and data structure
    if (result.data.code !== undefined) {
      // Success response with code 200 or 201
      if (result.data.code === 200 || result.data.code === 201) {
        // Return the full response object so endpoints can access both code, message, and data
        return { data: result.data };
      } else {
        // Error response with code != 200/201
        return {
          error: {
            status: result.data.code,
            data: { 
              message: result.data.message || 'An error occurred',
              code: result.data.code 
            },
          },
        };
      }
    }
  }
  
  // Log errors for debugging
  if (result.error) {
    console.error('API Error:', {
      status: result.error.status,
      data: result.error.data,
      error: result.error.error,
    });
  }
  
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Flower', 'Color', 'Order', 'User', 'Cart', 'Promotion', 'FlowerColor'],
  endpoints: () => ({}),
});
