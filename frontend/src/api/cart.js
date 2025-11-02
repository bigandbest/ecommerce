// src/api/cart.js
// This file contains all cart-related API endpoint constants.
// These are the base URLs for cart operations like adding items, removing items, updating quantities.
// Replace with your actual backend API endpoints.

export const CART_ENDPOINTS = {
  GET_CART: "/cart",
  ADD_ITEM: "/cart/add",
  REMOVE_ITEM: "/cart/remove/:itemId",
  UPDATE_ITEM: "/cart/update/:itemId",
  CLEAR_CART: "/cart/clear",
  GET_CART_TOTAL: "/cart/total",
};
