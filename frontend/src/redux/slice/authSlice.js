import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "../../utils/constants";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { showSuccess } from "../../utils/toast";

// Async thunks for API calls
export const loginUserApi = createAsyncThunk(
  'auth/loginUserApi',
  async (credentials, { rejectWithValue }) => {
    try {
        console.log("Making an api call: ", API_ENDPOINTS.LOGIN)
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);

      console.log("Received data: ", response);
      const { user, token } = response.data;
      
      // Store token in localStorage
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      
      showSuccess("Login successful!");
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      showError(message);
      return rejectWithValue(message);
    }
  }
);


const initialState = {
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  loading: false,
  error: null,

  // Specific loading states
  loginLoading: false,
  registerLoading: false,
  logoutLoading: false,
  profileLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Synchronous actions
    clearError: (state) => {
      state.error = null;
    },
    loginSuccess: (state, action) => {
        const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    },
     logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    },
  },

   extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUserApi.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })
      .addCase(loginUserApi.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUserApi.rejected, (state, action) => {
        state.loginLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
    }
});

export const { loginSuccess, logout, clearError } = authSlice.actions;
export default authSlice.reducer;