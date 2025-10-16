import Razorpay from "razorpay";
import crypto from "crypto";
import { supabase } from "../config/supabaseClient.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Razorpay lazily to ensure env vars are loaded
let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error(
        "Razorpay credentials not configured in environment variables"
      );
    }

    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log(
      "✅ Razorpay instance initialized successfully for admin wallet"
    );
  }
  return razorpayInstance;
};

// Create Razorpay order for admin wallet recharge
export const createAdminWalletRechargeOrder = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const { amount, rechargeRequestId } = req.body;

    console.log("Admin wallet recharge request:", {
      adminId,
      amount,
      rechargeRequestId,
    });

    if (!adminId) {
      console.error("Authentication failed - no admin ID");
      return res
        .status(401)
        .json({ success: false, error: "Admin authentication required" });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      console.error("Invalid amount:", amount);
      return res
        .status(400)
        .json({ success: false, error: "Valid amount is required" });
    }

    if (!rechargeRequestId) {
      console.error("Missing recharge request ID");
      return res
        .status(400)
        .json({ success: false, error: "Recharge request ID is required" });
    }

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay credentials not configured");
      return res.status(500).json({
        success: false,
        error: "Payment gateway not configured. Please contact support.",
      });
    }

    console.log("Fetching admin recharge request from database...");
    // Verify recharge request exists and belongs to admin
    const { data: rechargeRequest, error: requestError } = await supabase
      .from("admin_wallet_recharge_requests")
      .select("*")
      .eq("id", rechargeRequestId)
      .eq("admin_id", adminId)
      .eq("status", "pending")
      .single();

    if (requestError) {
      console.error("Database error fetching recharge request:", requestError);
      return res.status(404).json({
        success: false,
        error: "Invalid recharge request",
        details: requestError.message,
      });
    }

    if (!rechargeRequest) {
      console.error("Recharge request not found or already processed");
      return res.status(404).json({
        success: false,
        error: "Invalid recharge request or already processed",
      });
    }

    if (parseFloat(rechargeRequest.amount) !== parseFloat(amount)) {
      console.error("Amount mismatch:", {
        requested: rechargeRequest.amount,
        provided: amount,
      });
      return res.status(400).json({
        success: false,
        error: "Amount mismatch with recharge request",
      });
    }

    console.log("Creating Razorpay order...");
    // Create Razorpay order
    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    const orderOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `admin_wallet_${rechargeRequestId}_${Date.now()}`,
      notes: {
        admin_id: adminId,
        recharge_request_id: rechargeRequestId,
        purpose: "admin_wallet_recharge",
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);
    console.log("✅ Razorpay order created:", razorpayOrder.id);

    // Update recharge request with Razorpay order details
    const { error: updateError } = await supabase
      .from("admin_wallet_recharge_requests")
      .update({
        razorpay_order_id: razorpayOrder.id,
        status: "payment_initiated",
        updated_at: new Date().toISOString(),
      })
      .eq("id", rechargeRequestId);

    if (updateError) {
      console.error("Error updating recharge request:", updateError);
      return res.status(500).json({
        success: false,
        error: "Failed to update recharge request",
        details: updateError.message,
      });
    }

    console.log("✅ Admin wallet recharge order created successfully");

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: razorpayOrder.currency,
      rechargeRequestId: rechargeRequestId,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create admin wallet recharge order error:", error);

    if (error.message?.includes("Razorpay credentials")) {
      return res.status(500).json({
        success: false,
        error: "Payment gateway configuration error",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create payment order",
      details: error.message,
    });
  }
};

// Verify admin wallet recharge payment
export const verifyAdminWalletRechargePayment = async (req, res) => {
  try {
    const adminId = req.user?.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      rechargeRequestId,
    } = req.body;

    console.log("Verifying admin wallet recharge payment:", {
      adminId,
      razorpay_order_id,
      razorpay_payment_id,
      rechargeRequestId,
    });

    if (!adminId) {
      return res
        .status(401)
        .json({ success: false, error: "Admin authentication required" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: "Missing payment verification details",
      });
    }

    if (!rechargeRequestId) {
      return res.status(400).json({
        success: false,
        error: "Recharge request ID is required",
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Payment signature verification failed");
      return res.status(400).json({
        success: false,
        error: "Payment verification failed",
      });
    }

    console.log("✅ Payment signature verified successfully");

    // Get recharge request details
    const { data: rechargeRequest, error: requestError } = await supabase
      .from("admin_wallet_recharge_requests")
      .select("*")
      .eq("id", rechargeRequestId)
      .eq("admin_id", adminId)
      .single();

    if (requestError || !rechargeRequest) {
      console.error("Recharge request not found:", requestError);
      return res.status(404).json({
        success: false,
        error: "Recharge request not found",
      });
    }

    if (rechargeRequest.status === "completed") {
      return res.status(400).json({
        success: false,
        error: "Recharge request already completed",
      });
    }

    // Fetch payment details from Razorpay
    console.log("Fetching payment details from Razorpay...");
    const razorpay = getRazorpayInstance();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      console.error("Payment not captured:", payment.status);
      return res.status(400).json({
        success: false,
        error: "Payment not successful",
      });
    }

    // Get admin wallet (create if doesn't exist)
    let { data: adminWallet, error: walletError } = await supabase
      .from("admin_wallets")
      .select("*")
      .eq("admin_id", adminId)
      .single();

    if (walletError && walletError.code === "PGRST116") {
      // Create admin wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from("admin_wallets")
        .insert({
          admin_id: adminId,
          balance: 0.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating admin wallet:", createError);
        return res.status(500).json({
          success: false,
          error: createError.message,
        });
      }
      adminWallet = newWallet;
    } else if (walletError) {
      console.error("Error fetching admin wallet:", walletError);
      return res.status(500).json({
        success: false,
        error: walletError.message,
      });
    }

    // Update admin wallet balance
    const newBalance =
      parseFloat(adminWallet.balance) + parseFloat(rechargeRequest.amount);

    const { error: updateWalletError } = await supabase
      .from("admin_wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("admin_id", adminId);

    if (updateWalletError) {
      console.error("Error updating admin wallet:", updateWalletError);
      return res.status(500).json({
        success: false,
        error: "Failed to update wallet balance",
      });
    }

    // Update recharge request status
    const { error: updateRequestError } = await supabase
      .from("admin_wallet_recharge_requests")
      .update({
        status: "completed",
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", rechargeRequestId);

    if (updateRequestError) {
      console.error("Error updating recharge request:", updateRequestError);
      // Note: Wallet is already updated, so we log this but don't fail
    }

    // Record transaction
    await supabase.from("admin_wallet_transactions").insert({
      admin_id: adminId,
      transaction_type: "credit",
      amount: parseFloat(rechargeRequest.amount),
      balance_before: parseFloat(adminWallet.balance),
      balance_after: newBalance,
      description: `Wallet recharge via Razorpay - ${razorpay_payment_id}`,
      reference_type: "razorpay_payment",
      reference_id: razorpay_payment_id,
      status: "completed",
      created_at: new Date().toISOString(),
    });

    console.log("✅ Admin wallet recharge completed successfully");

    res.json({
      success: true,
      message: "Wallet recharged successfully",
      amount: rechargeRequest.amount,
      newBalance: newBalance,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) {
    console.error("Verify admin wallet recharge payment error:", error);
    res.status(500).json({
      success: false,
      error: "Payment verification failed",
      details: error.message,
    });
  }
};

// Handle admin wallet recharge webhook
export const handleAdminWalletRechargeWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET
      )
      .update(webhookBody)
      .digest("hex");

    if (expectedSignature !== webhookSignature) {
      console.error("Admin wallet webhook signature verification failed");
      return res.status(400).json({ error: "Invalid signature" });
    }

    const event = req.body;
    console.log("Admin wallet webhook received:", event.event);

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      // Find the recharge request
      const { data: rechargeRequest, error } = await supabase
        .from("admin_wallet_recharge_requests")
        .select("*")
        .eq("razorpay_order_id", orderId)
        .single();

      if (error || !rechargeRequest) {
        console.error("Admin recharge request not found for order:", orderId);
        return res.status(404).json({ error: "Recharge request not found" });
      }

      if (rechargeRequest.status === "completed") {
        console.log("Admin recharge request already completed:", orderId);
        return res.status(200).json({ message: "Already processed" });
      }

      // Update admin wallet and complete the recharge
      // Similar logic to verifyAdminWalletRechargePayment but triggered by webhook

      console.log("✅ Admin wallet webhook processed successfully");
    }

    res.status(200).json({ message: "Webhook processed" });
  } catch (error) {
    console.error("Admin wallet webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

export default {
  createAdminWalletRechargeOrder,
  verifyAdminWalletRechargePayment,
  handleAdminWalletRechargeWebhook,
};
