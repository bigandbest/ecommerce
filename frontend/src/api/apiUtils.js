// Common API utility functions
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://big-best-backend.vercel.app/api";

/**
 * Safe fetch wrapper that handles JSON parsing errors
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<object>} - API response or error object
 */
export async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    // Check if response is ok
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return {
        success: false,
        error: "Server returned non-JSON response",
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Handle JSON parsing errors silently
    if (error.message.includes("Unexpected token")) {
      return {
        success: false,
        error: "Invalid JSON response from server",
      };
    }

    // Handle network errors
    if (error.message === "Failed to fetch") {
      return {
        success: false,
        error: "Network error - server may be down",
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get API base URL
 * @returns {string} - Base API URL
 */
export function getApiBaseUrl() {
  return API_BASE_URL;
}

export default safeFetch;
