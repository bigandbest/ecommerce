// src/services/orderService.js
// This file handles order-related API calls using Axios.
// It imports endpoints from ../api/orders.js and the Axios instance from ./api.js.
// Provides functions for CRUD operations on orders.

import api from "./api.js";
import { ORDER_ENDPOINTS } from "../api/orders.js";

// Get all orders
export const getAllOrders = async (params = {}) => {
  try {
    const response = await api.get(ORDER_ENDPOINTS.GET_ALL, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (id) => {
  try {
    const response = await api.get(
      ORDER_ENDPOINTS.GET_BY_ID.replace(":id", id)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await api.post(ORDER_ENDPOINTS.CREATE, orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update order
export const updateOrder = async (id, orderData) => {
  try {
    const response = await api.put(
      ORDER_ENDPOINTS.UPDATE.replace(":id", id),
      orderData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (id) => {
  try {
    const response = await api.post(ORDER_ENDPOINTS.CANCEL.replace(":id", id));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user's orders
export const getUserOrders = async (userId) => {
  try {
    const response = await api.get(
      ORDER_ENDPOINTS.GET_USER_ORDERS.replace(":userId", userId)
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
