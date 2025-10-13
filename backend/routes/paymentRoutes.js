// routes/paymentRoutes.js
import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  verifyRazorpaySignature,
  checkWalletBalance,
} from "../controller/paymentController.js";

const router = express.Router();

router.post("/create-order", createRazorpayOrder); // POST /api/payment/create-order
router.post("/verify-payment", verifyRazorpayPayment);
router.post("/verify-signature", verifyRazorpaySignature);
router.post("/check-wallet-balance", checkWalletBalance);

export default router;
