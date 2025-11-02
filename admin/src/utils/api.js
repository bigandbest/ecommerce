// admin/src/utils/api.js
// Axios instance for admin panel API calls to the backend
import axios from "axios";

// Create Axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Disable by default, enable per request if needed
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // For admin, we might use Supabase session token or JWT from cookies
    const token = localStorage.getItem("big-best-admin-auth-token");
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed?.access_token) {
          config.headers.Authorization = `Bearer ${parsed.access_token}`;
        }
      } catch {
        // Ignore parsing errors
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
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login or refresh token
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

export default api;
