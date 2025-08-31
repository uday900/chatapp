import axios from "axios";
import { showError } from "../utils/toast";
import { ENV } from "../config/env";
import { STORAGE_KEYS } from "../utils/constants";
import { API_ENDPOINTS } from "../utils/endpoints";

const api = axios.create({
  baseURL: ENV.API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor → attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN); // JWT saved after login
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      showError("Session expired, please login again.");
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      window.location.href = API_ENDPOINTS.LOGIN; // redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
