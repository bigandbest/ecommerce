import express from "express";
import { authenticateToken } from "../middleware/authenticate.js";
import {
  createRefundRequest,
  getAllRefundRequests,
  updateRefundRequestStatus,
  getUserRefundRequests,
} from "../controller/refundController.js";

const router = express.Router();

// User routes
router.post("/create", authenticateToken, createRefundRequest);
router.get("/my-requests", authenticateToken, getUserRefundRequests);

// Admin routes
router.get("/admin/all", authenticateToken, getAllRefundRequests);
router.put(
  "/admin/update-status/:id",
  authenticateToken,
  updateRefundRequestStatus
);

export default router;
