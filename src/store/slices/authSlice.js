import { createSlice } from '@reduxjs/toolkit';

const getInitialAuth = () => {
  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    if (token && user && role) {
      return {
        user: JSON.parse(user),
        token,
        role,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
  }
  
  return {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuth(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;
      state.isAuthenticated = true;
      
      // Save to localStorage (tokens are already saved in LoginPage)
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
