import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { showSuccess } from "../../utils/toast";
import { API_ENDPOINTS } from "../../utils/endpoints";
import { use } from "react";
import api from "../../services/axiosInstance";

export const fetchUserChats = createAsyncThunk(
  'fetchUserChats',
  async (userId, { rejectWithValue }) => {
    try {
      console.log("Making an api call: ", API_ENDPOINTS.CHATS(userId))
    
      const response = await api.get(API_ENDPOINTS.CHATS(userId));

      console.log("Received data: ", response);
      const { user, token } = response.data;

      // Store token in localStorage
      showSuccess("Login successful!");

      return { userDetails, token: credentials.password };
      // return { user, token };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      showError(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
    userChats: [],
    loading: false,
    error: null
};

const userChatSlice = createSlice({
    name: "userchat",
    initialState,
    reducers: {},
    extraReducers: (builder) => {}
})