import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "../../utils/constants";
import { showError, showSuccess } from "../../utils/toast";
import { API_ENDPOINTS } from "../../utils/endpoints";
import api from "../../api/axios";

// =======================
// Login API
// =======================
export const loginUserApi = createAsyncThunk(
  "auth/loginUserApi",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("Making API call:", API_ENDPOINTS.LOGIN);
      console.log("Body:", credentials);

      const response = await api.post(
        API_ENDPOINTS.LOGIN,
        credentials
      );

      console.log("Received data:", response.data);

      const { user, token } = response.data.data;

      showSuccess("Login successful!");

      return {
        token,
        user: {
          id: user?.id,
          full_name: user?.full_name,
          profile_picture: user?.profile_picture,
          email: user?.email,
        },
      };
    } catch (error) {
      console.error("Login error:", error);

      const message =
        error?.response?.data?.message ||
        "Login failed";

      showError(message);

      return rejectWithValue(message);
    }
  }
);

export const registerUserApi = createAsyncThunk(
  "auth/registerUserApi",
  async (userData, { rejectWithValue }) => {
    try {
      console.log(
        "Making API call:",
        API_ENDPOINTS.REGISTER
      );
      console.log("Request Body:", userData);

      /**
       * Expected payload:
       * {
       *   full_name,
       *   mobile_number,
       *   email,
       *   password
       * }
       */

      const response = await api.post(
        API_ENDPOINTS.REGISTER,
        userData
      );

      console.log("Register Response:", response.data);

      /**
       * Example backend response:
       * {
       *   message: "User registered successfully"
       * }
       */

      showSuccess(
        response.data?.message ||
          "Account created successfully!"
      );

      return response.data;
    } catch (error) {
      console.error("Register Error:", error);

      const message =
        error?.response?.data?.message ||
        "Registration failed";

      showError(message);

      return rejectWithValue(message);
    }
  }
);

// =======================
// Initial State
// =======================
const initialState = {
  user: JSON.parse(
    localStorage.getItem(STORAGE_KEYS.USER_DATA)
  ) || null,

  token:
    localStorage.getItem(
      STORAGE_KEYS.ACCESS_TOKEN
    ) || null,

  isAuthenticated: !!localStorage.getItem(
    STORAGE_KEYS.ACCESS_TOKEN
  ),

  error: null,

  loginLoading: false,
  registerLoading: false,
  logoutLoading: false,
  profileLoading: false,
};

// =======================
// Slice
// =======================
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem(
        STORAGE_KEYS.ACCESS_TOKEN
      );

      localStorage.removeItem(
        STORAGE_KEYS.USER_DATA
      );
    },
  },

  extraReducers: (builder) => {
    builder

      // =======================
      // Login Pending
      // =======================
      .addCase(loginUserApi.pending, (state) => {
        state.loginLoading = true;
        state.error = null;
      })

      // =======================
      // Login Success
      // =======================
      .addCase(
        loginUserApi.fulfilled,
        (state, action) => {
          console.log("Login fulfilled, updating state...", action.payload);
          state.loginLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;

          // Store token
          localStorage.setItem(
            STORAGE_KEYS.ACCESS_TOKEN,
            action.payload.token
          );

          // Store user details only
          localStorage.setItem(
            STORAGE_KEYS.USER_DATA,
            JSON.stringify({
              id: action.payload.user?.id,
              full_name:
                action.payload.user?.full_name,
              profile_picture:
                action.payload.user?.profile_picture,
              email: action.payload.user?.email,
            })
          );
        }
      )

      // =======================
      // Login Failed
      // =======================
      .addCase(
        loginUserApi.rejected,
        (state, action) => {
          state.loginLoading = false;
          state.error = action.payload;
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;

          // clear invalid session
          localStorage.removeItem(
            STORAGE_KEYS.ACCESS_TOKEN
          );

          localStorage.removeItem(
            STORAGE_KEYS.USER_DATA
          );
        }
      )

      // =======================
    // Register
    // =======================
    .addCase(registerUserApi.pending, (state) => {
      state.registerLoading = true;
      state.error = null;
    })

    .addCase(registerUserApi.fulfilled, (state) => {
      state.registerLoading = false;
      state.error = null;

      /**
       * No token stored here
       * User should login after signup
       */
    })

    .addCase(registerUserApi.rejected, (state, action) => {
      state.registerLoading = false;
      state.error = action.payload;
    });
  },
});

export const {
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;