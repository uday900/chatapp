import { API_ENDPOINTS } from "../../utils/endpoints";
import api from "../axios";

export const forgotPassword = async (
  email
) => {
  try {
    const response = await api.post(
      API_ENDPOINTS.FORGOT_PASSWORD,
      { email }
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const verifyForgotOtp = async (
  email,
  otp
) => {
  try {
    const response = await api.post(
      API_ENDPOINTS.VERIFY_FORGOT_OTP,
      {
        email,
        otp,
      }
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const resetPassword = async (
  resetToken,
  newPassword
) => {
  try {
    const response = await api.post(
      API_ENDPOINTS.RESET_PASSWORD,
      {
        resetToken,
        newPassword,
      }
    );

    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

/*
  Normalize backend errors
*/
const normalizeApiError = (
  error
) => {
    console.error("API Error:", error);
  if (!error.response) {
    return {
      status: 500,
      message:
        "Network error. Please try again.",
    };
  }

  if (error.response.status === 429) {
    return {
      status: 429,
      message:
        "Too many requests. Try later.",
    };
  }

  return {
    status: error.response.status,
    message:
      error.response.data?.message ||
      "Something went wrong",
  };
};