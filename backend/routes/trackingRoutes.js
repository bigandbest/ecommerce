import express from "express";
import {
  getOrderTracking,
  addTrackingUpdate,
  searchByTrackingNumber,
} from "../controller/trackingController.js";
import { authenticateToken } from "../middleware/authenticate.js";

const router = express.Router();

// Get order tracking by order ID
router.get("/order/:orderId", getOrderTracking);

// Search by tracking number
router.get("/search/:trackingNumber", searchByTrackingNumber);

// Add tracking update (Admin only)
router.post("/update", authenticateToken, addTrackingUpdate);

export default router;