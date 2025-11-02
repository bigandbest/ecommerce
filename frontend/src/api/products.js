// src/api/products.js
// This file contains all product-related API endpoint constants.
// These are the base URLs for product operations like fetching, creating, updating, deleting products.
// Replace with your actual backend API endpoints.

export const PRODUCT_ENDPOINTS = {
  GET_ALL: "/products",
  GET_BY_ID: "/products/:id",
  CREATE: "/products",
  UPDATE: "/products/:id",
  DELETE: "/products/:id",
  GET_BY_CATEGORY: "/products/category/:categoryId",
  SEARCH: "/products/search",
  GET_FEATURED: "/products/featured",
  GET_BEST_SELLERS: "/products/best-sellers",
};
