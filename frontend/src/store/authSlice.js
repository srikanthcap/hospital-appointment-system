import { createSlice } from '@reduxjs/toolkit';

// Retrieve initial state from localStorage to persist sessions across refreshes
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const userId = localStorage.getItem('userId');
const fullName = localStorage.getItem('fullName');

const initialState = {
  token: token || null,
  role: role || null,
  userId: userId ? parseInt(userId, 10) : null,
  fullName: fullName || null,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { access_token, role, user_id, full_name } = action.payload;
      state.token = access_token;
      state.role = role;
      state.userId = user_id;
      state.fullName = full_name;
      state.isAuthenticated = true;

      // Save to localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', user_id.toString());
      localStorage.setItem('fullName', full_name);
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.userId = null;
      state.fullName = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('fullName');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
