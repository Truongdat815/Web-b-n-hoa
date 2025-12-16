import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use environment variable for API URL, fallback to '/api' for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    // Set content type for JSON requests
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Custom baseQuery with error handling
const baseQuery = async (args, api, extraOptions) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  
  // Handle API response format: { code, message, data }
  if (result.data) {
    // If response has code and data structure
    if (result.data.code !== undefined) {
      // Success response with code 200
      if (result.data.code === 200) {
        // Return the full response object so endpoints can access both code, message, and data
        return { data: result.data };
      } else {
        // Error response with code != 200
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
  tagTypes: ['Flower', 'Color', 'Order', 'User', 'Cart', 'Promotion'],
  endpoints: () => ({}),
});
