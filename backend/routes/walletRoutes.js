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
  freezeWallet,
  unfreezeWallet,
  getWalletTransactionHistory,
  getAdminWalletDetails,
  createAdminWalletRechargeRequest,
  transferMoneyToUser,
} from "../controller/walletController.js";
import {
  createWalletRechargeOrder,
  verifyWalletRechargePayment,
  handleWalletRechargeWebhook,
} from "../controller/walletRechargeController.js";
import {
  createAdminWalletRechargeOrder,
  verifyAdminWalletRechargePayment,
  handleAdminWalletRechargeWebhook,
} from "../controller/adminWalletRechargeController.js";

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
router.post("/admin/freeze/:userId", authenticateToken, freezeWallet);
router.post("/admin/unfreeze/:userId", authenticateToken, unfreezeWallet);
router.get(
  "/admin/transactions/:userId",
  authenticateToken,
  getWalletTransactionHistory
);

// Admin wallet management routes
router.get("/admin/wallet-details", authenticateToken, getAdminWalletDetails);
router.post(
  "/admin/wallet-recharge/request",
  authenticateToken,
  createAdminWalletRechargeRequest
);
router.post(
  "/admin/wallet-recharge/create-order",
  authenticateToken,
  createAdminWalletRechargeOrder
);
router.post(
  "/admin/wallet-recharge/verify-payment",
  authenticateToken,
  verifyAdminWalletRechargePayment
);
router.post("/admin/transfer-to-user", authenticateToken, transferMoneyToUser);

// Webhook routes (no authentication required)
router.post("/webhook/recharge", handleWalletRechargeWebhook);
router.post("/webhook/admin-recharge", handleAdminWalletRechargeWebhook);

export default router;
