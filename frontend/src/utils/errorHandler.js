// src/utils/errorHandler.js
// This file contains error handling utilities.
// It provides functions to handle and format API errors consistently.

import { API_STATUS } from "./constants.js";

// Handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    switch (status) {
      case API_STATUS.UNAUTHORIZED:
        return {
          message: "Unauthorized access. Please log in again.",
          code: status,
        };
      case API_STATUS.FORBIDDEN:
        return { message: "Access forbidden.", code: status };
      case API_STATUS.NOT_FOUND:
        return { message: "Resource not found.", code: status };
      case API_STATUS.BAD_REQUEST:
        return { message: data?.message || "Bad request.", code: status };
      default:
        return {
          message: "An error occurred. Please try again.",
          code: status,
        };
    }
  } else if (error.request) {
    // Network error
    return {
      message: "Network error. Please check your connection.",
      code: null,
    };
  } else {
    // Other error
    return {
      message: error.message || "An unexpected error occurred.",
      code: null,
    };
  }
};

// Log error for debugging
export const logError = (error, context = "") => {
  console.error(`Error in ${context}:`, error);
  // You can integrate with error logging services here (e.g., Sentry)
};
