import { createSlice } from '@reduxjs/toolkit';
import { isAdminEmail } from '../../config/admin';

const decodeJWT = (token) => {
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
  } catch {
    return null;
  }
};

const isAccessTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  const exp = decoded?.exp;
  if (!exp) return false; // if token doesn't have exp, don't force logout
  return Date.now() >= exp * 1000;
};

const getInitialAuth = () => {
  try {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    // If token is expired, clear stale auth so UI doesn't show a logged-in user incorrectly
    if (token && isAccessTokenExpired(token)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      return {
        user: null,
        token: null,
        refreshToken: null,
        role: null,
        isAuthenticated: false,
      };
    }

    if (token) {
      const decoded = decodeJWT(token);
      const derivedRole = role || decoded?.roleName || null;
      const derivedUser = user
        ? JSON.parse(user)
        : (decoded?.sub ? { email: decoded.sub, role: decoded?.roleName } : null);

      // Enforce: only allowlisted emails can be ADMIN in the frontend
      let effectiveRole = derivedRole;
      if (effectiveRole === 'ADMIN' && !isAdminEmail(derivedUser?.email)) {
        effectiveRole = 'CUSTOMER';
      }

      return {
        user: derivedUser,
        token,
        refreshToken,
        role: effectiveRole,
        isAuthenticated: Boolean(token && effectiveRole),
      };
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
  }
  
  return {
    user: null,
    token: null,
    refreshToken: null,
    role: null,
    isAuthenticated: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuth(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken || state.refreshToken || localStorage.getItem('refreshToken') || null;
      state.role = role;
      state.isAuthenticated = true;
      
      // Save to localStorage (tokens are already saved in LoginPage)
      localStorage.setItem('accessToken', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
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
