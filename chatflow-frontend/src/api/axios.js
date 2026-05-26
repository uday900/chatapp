import axios from "axios";
import { showError } from "../utils/toast";
import { STORAGE_KEYS } from "../utils/constants";
import { API_ENDPOINTS } from "../utils/endpoints";

const apiUrl = import.meta.env.VITE_API_BASE_URL || ENV.API_BASE;

const api = axios.create({
  baseURL: apiUrl,
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
  (response) => {
    // Notify app that backend responded successfully (in case it was previously marked down)
    try {
      window.dispatchEvent(new CustomEvent("server-up"));
    } catch (e) {
      // ignore
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && (error.response?.data?.errorCode === "TOKEN_EXPIRED")) {
      showError("Session expired, please login again.");
      console.warn("Token expired, redirecting to login...");
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      window.location.href = API_ENDPOINTS.LOGIN; // redirect to login
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            !error.response ||
            error.code === "ECONNABORTED"
        ) {
            console.error(
                "Backend unavailable"
            );

            /*
              Global UI state:
              server down
            */
            window.dispatchEvent(
                new CustomEvent(
                    "server-down"
                )
            );
        }

        return Promise.reject(error);
    }
);

export default api;
