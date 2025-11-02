import express from "express";
import {
  mapProductToDailyDeal,
  removeProductFromDailyDeal,
  getDailyDealsForProduct,
  getProductsForDailyDeal,
  bulkMapProductsToDailyDeal,
} from "../controller/dailyDealsProductController.js";

const router = express.Router();

// Map a product to a daily deal
router.post("/map", mapProductToDailyDeal);

// Remove a product from a daily deal
router.delete("/remove", removeProductFromDailyDeal);

// Get daily deals for a product
router.get("/product/:product_id", getDailyDealsForProduct);

// Get products for a daily deal
router.get("/daily-deal/:daily_deal_id", getProductsForDailyDeal);

// Bulk map products to a daily deal
router.post("/bulk-map", bulkMapProductsToDailyDeal);

export default router;
