// src/api/auth.js
// Authentication endpoints for customer users (using Supabase auth)

export const AUTH_ENDPOINTS = {
  // These are not direct API calls since we use Supabase client
  // But keeping for consistency with service layer
  LOGIN: "supabase-auth",
  REGISTER: "supabase-auth",
  LOGOUT: "supabase-auth",
  REFRESH_TOKEN: "supabase-auth",
  FORGOT_PASSWORD: "supabase-auth",
  RESET_PASSWORD: "supabase-auth",
  VERIFY_EMAIL: "supabase-auth",
  ME: "supabase-auth",
};
