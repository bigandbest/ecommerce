// src/services/dailyDealsService.js
import api from "./api";

export const dailyDealsService = {
  // Fetch all active daily deals
  async getAllDailyDeals() {
    try {
      const response = await api.get("/daily-deals/list");
      return response.data;
    } catch (error) {
      console.error("Error fetching daily deals:", error);
      throw error;
    }
  },

  // Get a specific daily deal by ID
  async getDailyDealById(id) {
    try {
      const response = await api.get(`/daily-deals/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching daily deal:", error);
      throw error;
    }
  },

  // Get all products for a specific daily deal
  async getProductsForDailyDeal(dailyDealId) {
    try {
      const response = await api.get(
        `/daily-deals-product/daily-deal/${dailyDealId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching products for daily deal:", error);
      throw error;
    }
  },
};
