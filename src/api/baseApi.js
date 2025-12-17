import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use environment variable for API URL, fallback to '/api' for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://160.25.232.214:8080/api';

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth.token || localStorage.getItem('accessToken');
    // Public auth endpoints must not attach Authorization header
    const noAuthEndpoints = ['login', 'refreshToken', 'register'];
    if (token && !noAuthEndpoints.includes(endpoint)) {
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
  const refreshTokenValue = localStorage.getItem('refreshToken');
  if (!refreshTokenValue) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    const data = await response.json();
    // Response format: { code, message, data: { token, expiryDate } }
    if (data.code === 200 || data.code === 0) {
      const tokenData = data.data || data;
      const newAccessToken = tokenData.token; // Field name is "token" not "accessToken"
      const expiryDate = tokenData.expiryDate;
      
      if (newAccessToken) {
        // Save new access token
        localStorage.setItem('accessToken', newAccessToken);
        
        // Save expiry date if available
        if (expiryDate) {
          const expiryTimestamp = new Date(expiryDate).getTime();
          localStorage.setItem('accessTokenExpiry', expiryTimestamp.toString());
        }
        
        return newAccessToken;
      }
    }
  } catch (error) {
    console.error('Refresh token failed:', error);
  }
  return null;
};

// Check if access token is expired or about to expire (within 1 minute)
const isTokenExpiredOrExpiringSoon = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return true;
  
  // Check expiry from localStorage first
  const expiryTimestamp = localStorage.getItem('accessTokenExpiry');
  if (expiryTimestamp) {
    const expiryTime = parseInt(expiryTimestamp);
    const now = Date.now();
    const oneMinute = 60 * 1000;
    // Return true if expired or will expire within 1 minute
    return now >= (expiryTime - oneMinute);
  }
  
  // Fallback: decode JWT to check exp claim
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = JSON.parse(atob(base64));
    const exp = jsonPayload?.exp;
    if (exp) {
      const expiryTime = exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const oneMinute = 60 * 1000;
      return now >= (expiryTime - oneMinute);
    }
  } catch (error) {
    console.error('Error checking token expiry:', error);
  }
  
  return false;
};

// Custom baseQuery with error handling and auto refresh token
const baseQuery = async (args, api, extraOptions) => {
  // Check if token is expired or expiring soon BEFORE making the request
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath === '/login' || currentPath === '/register';
  const isAuthEndpoint =
    args?.url?.includes('/auth/login') ||
    args?.url?.includes('/auth/refresh') ||
    args?.url?.includes('/auth/register');
  const hasToken = api.getState().auth.token || localStorage.getItem('accessToken');
  
  // Auto refresh token if expired or expiring soon (before making request)
  if (hasToken && !isAuthPage && !isAuthEndpoint && isTokenExpiredOrExpiringSoon()) {
    const newToken = await refreshToken();
    if (newToken) {
      // Update Redux store with new token
      api.dispatch({
        type: 'auth/setCredentials',
        payload: {
          token: newToken,
          user: api.getState().auth.user,
          role: api.getState().auth.role,
          refreshToken: localStorage.getItem('refreshToken'),
        },
      });
    }
  }
  
  let result = await baseQueryWithAuth(args, api, extraOptions);
  
  // Handle 401 Unauthorized - try to refresh token (fallback if auto-refresh didn't work)
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
            refreshToken: localStorage.getItem('refreshToken'),
          },
        });
        // Retry the original request with new token
        result = await baseQueryWithAuth(args, api, extraOptions);
      } else {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessTokenExpiry');
        localStorage.removeItem('refreshTokenExpiry');
        api.dispatch({ type: 'auth/logout' });
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
      // Success response (some backends use 0, others use 200/201)
      if (result.data.code === 0 || result.data.code === 200 || result.data.code === 201) {
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
