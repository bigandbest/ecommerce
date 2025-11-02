// src/api/orders.js
// This file contains all order-related API endpoint constants.
// These are the base URLs for order operations like placing orders, fetching order history, etc.
// Replace with your actual backend API endpoints.

export const ORDER_ENDPOINTS = {
  GET_ALL: "/orders",
  GET_BY_ID: "/orders/:id",
  CREATE: "/orders",
  UPDATE: "/orders/:id",
  CANCEL: "/orders/:id/cancel",
  GET_USER_ORDERS: "/orders/user/:userId",
  GET_ORDER_HISTORY: "/orders/history",
};
