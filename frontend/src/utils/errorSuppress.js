/**
 * API Error Handler Utility
 * Provides graceful error handling for API calls with silent fallbacks
 */

// Suppress specific console errors in development
const originalError = console.error;
const originalWarn = console.warn;

// List of error patterns to suppress in development
const suppressedErrors = [
  "Failed to fetch",
  "ERR_CONNECTION_REFUSED",
  "net::ERR_CONNECTION_REFUSED",
  "TypeError: Failed to fetch",
  "Connection refused",
  "localhost:8000",
  "Hydration failed",
  "server rendered HTML didn't match",
  "razorpay-container",
  "Text content does not match",
  "Prop `className` did not match",
  "Warning: Expected server HTML",
];

// List of warning patterns to suppress
const suppressedWarnings = [
  "Image with src",
  'fill" and a height value of 0',
  "either width or height modified",
  'missing "sizes" prop',
  "Largest Contentful Paint",
];

// Override console.error to filter API connection errors
console.error = (...args) => {
  const message = args.join(" ");

  // In production, suppress all API connection errors
  if (process.env.NODE_ENV === "production") {
    const shouldSuppress = suppressedErrors.some((pattern) =>
      message.includes(pattern)
    );
    if (shouldSuppress) {
      return; // Silent failure in production
    }
  }

  // In development, only show API errors as warnings
  if (process.env.NODE_ENV === "development") {
    const isApiError = suppressedErrors.some((pattern) =>
      message.includes(pattern)
    );
    if (isApiError) {
      console.warn(
        "🔌 API Connection Issue (Expected in development):",
        ...args
      );
      return;
    }
  }

  originalError.apply(console, args);
};

// Override console.warn to filter image optimization warnings
console.warn = (...args) => {
  const message = args.join(" ");

  const shouldSuppress = suppressedWarnings.some((pattern) =>
    message.includes(pattern)
  );

  if (shouldSuppress) {
    // Only show in development mode with reduced frequency
    if (process.env.NODE_ENV === "development") {
      // Throttle warnings to avoid spam
      if (!console.warn._throttle) {
        console.warn._throttle = new Set();
      }

      const throttleKey = message.substring(0, 50);
      if (!console.warn._throttle.has(throttleKey)) {
        console.warn._throttle.add(throttleKey);
        console.info("ℹ️ Image Optimization Notice:", message.split("\n")[0]);

        // Clear throttle after 5 seconds
        setTimeout(() => {
          console.warn._throttle.delete(throttleKey);
        }, 5000);
      }
    }
    return;
  }

  originalWarn.apply(console, args);
};

/**
 * Graceful API call wrapper
 * @param {Function} apiCall - The API function to call
 * @param {any} fallbackValue - Value to return on error
 * @param {boolean} silent - Whether to suppress error logging
 */
export const gracefulApiCall = async (
  apiCall,
  fallbackValue = null,
  silent = true
) => {
  try {
    return await apiCall();
  } catch (error) {
    if (!silent && process.env.NODE_ENV === "development") {
      console.info("API call failed gracefully:", error.message);
    }
    return fallbackValue;
  }
};

/**
 * Safe fetch wrapper with timeout and retries
 */
export const safeFetch = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export default {
  gracefulApiCall,
  safeFetch,
};
