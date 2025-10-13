import express from "express";
import { authenticateToken } from "../middleware/authenticate.js";
import {
  getWalletDetails,
  getTransactionHistory,
  createRechargeRequest,
  processWalletPayment,
  processWalletRefund,
  addMoneyToWallet,
  getWalletStatistics,
  getRechargeRequests,
  getUsersWithWallets,
} from "../controller/walletController.js";
import {
  createWalletRechargeOrder,
  verifyWalletRechargePayment,
  handleWalletRechargeWebhook,
} from "../controller/walletRechargeController.js";

const router = express.Router();

// User wallet routes (require authentication)
router.get("/details", authenticateToken, getWalletDetails);
router.get("/details/:userId", authenticateToken, getWalletDetails);
router.get("/transactions", authenticateToken, getTransactionHistory);
router.get("/transactions/:userId", authenticateToken, getTransactionHistory);

// Wallet recharge routes
router.post("/recharge/request", authenticateToken, createRechargeRequest);
router.post(
  "/recharge/create-order",
  authenticateToken,
  createWalletRechargeOrder
);
router.post(
  "/recharge/verify-payment",
  authenticateToken,
  verifyWalletRechargePayment
);

// Wallet payment processing
router.post("/pay", authenticateToken, processWalletPayment);

// Admin routes (additional authentication needed)
router.post("/refund", authenticateToken, processWalletRefund);
router.post("/admin/add-money", authenticateToken, addMoneyToWallet);
router.get("/admin/statistics", authenticateToken, getWalletStatistics);
router.get("/admin/recharge-requests", authenticateToken, getRechargeRequests);
router.get("/admin/users-with-wallets", authenticateToken, getUsersWithWallets);

// Webhook route (no authentication required)
router.post("/webhook/recharge", handleWalletRechargeWebhook);

export default router;
