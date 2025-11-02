// src/utils/helpers.js
// This file contains utility helper functions.
// These can include data formatting, validation, etc.
// Add any reusable helper functions here.

import { PAGINATION } from "./constants.js";

// Format currency
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// Validate email
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Get pagination params
export const getPaginationParams = (
  page = 1,
  limit = PAGINATION.DEFAULT_PAGE_SIZE
) => {
  return {
    page: Math.max(1, page),
    limit: Math.min(limit, PAGINATION.MAX_PAGE_SIZE),
  };
};
