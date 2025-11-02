// src/services/userService.js
// This file handles user-related API calls using Axios.
// It imports endpoints from ../api/users.js and the Axios instance from ./api.js.
// Provides functions for user profile and address management.

import api from "./api.js";
import { USER_ENDPOINTS } from "../api/users.js";

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await api.get(USER_ENDPOINTS.GET_PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put(USER_ENDPOINTS.UPDATE_PROFILE, profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user addresses
export const getUserAddresses = async () => {
  try {
    const response = await api.get(USER_ENDPOINTS.GET_ADDRESSES);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add address
export const addUserAddress = async (addressData) => {
  try {
    const response = await api.post(USER_ENDPOINTS.ADD_ADDRESS, addressData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update address
export const updateUserAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(
      USER_ENDPOINTS.UPDATE_ADDRESS.replace(":addressId", addressId),
      addressData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete address
export const deleteUserAddress = async (addressId) => {
  try {
    const response = await api.delete(
      USER_ENDPOINTS.DELETE_ADDRESS.replace(":addressId", addressId)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await api.post(
      USER_ENDPOINTS.CHANGE_PASSWORD,
      passwordData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
