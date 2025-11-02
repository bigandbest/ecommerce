// src/services/cartService.js
// This file handles cart-related API calls using Axios.
// It imports endpoints from ../api/cart.js and the Axios instance from ./api.js.
// Provides functions for cart operations like adding/removing items.

import api from "./api.js";
import { CART_ENDPOINTS } from "../api/cart.js";

// Get cart
export const getCart = async () => {
  try {
    const response = await api.get(CART_ENDPOINTS.GET_CART);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add item to cart
export const addItemToCart = async (itemData) => {
  try {
    const response = await api.post(CART_ENDPOINTS.ADD_ITEM, itemData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove item from cart
export const removeItemFromCart = async (itemId) => {
  try {
    const response = await api.delete(
      CART_ENDPOINTS.REMOVE_ITEM.replace(":itemId", itemId)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update item in cart
export const updateCartItem = async (itemId, updateData) => {
  try {
    const response = await api.put(
      CART_ENDPOINTS.UPDATE_ITEM.replace(":itemId", itemId),
      updateData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    const response = await api.post(CART_ENDPOINTS.CLEAR_CART);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get cart total
export const getCartTotal = async () => {
  try {
    const response = await api.get(CART_ENDPOINTS.GET_CART_TOTAL);
    return response.data;
  } catch (error) {
    throw error;
  }
};
