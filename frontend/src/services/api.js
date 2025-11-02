// src/services/api.js
// This file sets up the Axios instance with base configuration, interceptors, and error handling.
// It includes request interceptors to add JWT tokens and response interceptors to handle 401 errors.
// Import this instance in other service files instead of creating new Axios instances.

import axios from "axios";

// Create Axios instance with base URL from environment variables
const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    "https://big-best-backend.vercel.app/api",
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Try to get token from different possible sources
      let token = localStorage.getItem("token");
      
      // If no direct token, try to get from Supabase session
      if (!token || token === "null" || token === "undefined" || token.trim() === "") {
        try {
          const userSession = localStorage.getItem("user_session");
          if (userSession) {
            const session = JSON.parse(userSession);
            token = session.access_token;
          }
        } catch (e) {
          console.warn("Error parsing user session:", e);
        }
      }
      
      // Only add Authorization header if we have a valid token
      if (token && token.trim() !== "" && token !== "null" && token !== "undefined") {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Enhanced error logging for debugging
    console.error("API Error Details:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message
    });

    // Handle network errors or HTML responses
    if (!error.response) {
      console.error("Network error or server not responding:", error.message);
      return Promise.reject(
        new Error("Network error. Please check if the server is running.")
      );
    }

    // Handle HTML responses (when server returns HTML instead of JSON)
    const contentType = error.response.headers["content-type"];
    if (contentType && contentType.includes("text/html")) {
      console.error(
        "Server returned HTML instead of JSON. Check API endpoint."
      );
      return Promise.reject(new Error("Server error. Please try again later."));
    }

    // Handle 400 errors that might be caused by invalid auth tokens
    if (error.response?.status === 400 && error.config?.headers?.Authorization) {
      console.warn("400 error with auth token, retrying without token...");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      // Retry the request without the Authorization header
      const retryConfig = { ...error.config };
      delete retryConfig.headers.Authorization;
      try {
        return await api.request(retryConfig);
      } catch (retryError) {
        console.error("Retry without token also failed:", retryError);
        return Promise.reject(retryError);
      }
    }

    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Don't redirect for API calls, let the component handle it
        console.warn("Unauthorized access, token cleared");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
