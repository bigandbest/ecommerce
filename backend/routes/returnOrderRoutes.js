// routes/returnOrderRoutes.js
import express from "express";
import {
  testDatabase,
  checkReturnEligibility,
  createReturnRequest,
  getUserReturnRequests,
  getAllReturnRequests,
  updateReturnRequestStatus,
  getReturnRequestDetails,
  deleteReturnRequest,
} from "../controller/returnOrderController.js";

const router = express.Router();

// Test route
router.get("/test", testDatabase);

// User routes
router.get("/eligibility/:order_id", checkReturnEligibility);
router.post("/create", createReturnRequest);
router.get("/user/:user_id", getUserReturnRequests);
router.get("/details/:id", getReturnRequestDetails);

// Admin routes
router.get("/admin/all", getAllReturnRequests);
router.put("/admin/status/:id", updateReturnRequestStatus);
router.delete("/admin/delete/:id", deleteReturnRequest);

export default router;
