// src/api/users.js
// This file contains all user-related API endpoint constants.
// These are the base URLs for user operations like profile management, addresses, etc.
// Replace with your actual backend API endpoints.

export const USER_ENDPOINTS = {
  GET_PROFILE: "/users/profile",
  UPDATE_PROFILE: "/users/profile",
  GET_ADDRESSES: "/users/addresses",
  ADD_ADDRESS: "/users/addresses",
  UPDATE_ADDRESS: "/users/addresses/:addressId",
  DELETE_ADDRESS: "/users/addresses/:addressId",
  CHANGE_PASSWORD: "/users/change-password",
  UPLOAD_AVATAR: "/users/avatar",
};
