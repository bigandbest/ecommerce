// src/api/videoCardApi.js
// API functions for video card-related operations

import { safeFetch, getApiBaseUrl } from './apiUtils';

const API_BASE_URL = getApiBaseUrl();

/**
 * Fetch all video cards
 * @returns {Promise<{success: boolean, videoCards: Array}>}
 */
export async function getAllVideoCards() {
  return await safeFetch(`${API_BASE_URL}/video-cards/all`);
}

/**
 * Fetch active video cards
 * @returns {Promise<{success: boolean, videoCards: Array}>}
 */
export async function getActiveVideoCards() {
  return await safeFetch(`${API_BASE_URL}/video-cards/active`);
}

/**
 * Fetch a single video card by ID
 * @param {string} id - The ID of the video card
 * @returns {Promise<{success: boolean, videoCard: Object}>}
 */
export async function getVideoCardById(id) {
  return await safeFetch(`${API_BASE_URL}/video-cards/${id}`);
}
