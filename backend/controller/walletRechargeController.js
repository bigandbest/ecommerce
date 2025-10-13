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

    console.log("✅ Razorpay instance initialized successfully");
  }
  return razorpayInstance;
};

// Create Razorpay order for wallet recharge
export const createWalletRechargeOrder = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount, rechargeRequestId } = req.body;

    console.log("Wallet recharge request:", {
      userId,
      amount,
      rechargeRequestId,
    });

    if (!userId) {
      console.error("Authentication failed - no user ID");
      return res
        .status(401)
        .json({ success: false, error: "User authentication required" });
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

    console.log("Fetching recharge request from database...");
    // Verify recharge request exists and belongs to user
    const { data: rechargeRequest, error: requestError } = await supabase
      .from("wallet_recharge_requests")
      .select("*")
      .eq("id", rechargeRequestId)
      .eq("user_id", userId)
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
      return res.status(400).json({ success: false, error: "Amount mismatch" });
    }

    // Create Razorpay order
    // Generate a short receipt ID (max 40 chars as per Razorpay requirement)
    // Format: WR_<timestamp>_<last8ofUUID>
    const shortReceiptId = `WR_${Date.now()}_${rechargeRequestId.slice(-8)}`;

    const options = {
      amount: amount * 100, // convert to paisa
      currency: "INR",
      receipt: shortReceiptId, // Max 40 characters
      payment_capture: 1,
      notes: {
        user_id: userId,
        recharge_request_id: rechargeRequestId,
        purpose: "wallet_recharge",
      },
    };

    console.log("Creating Razorpay order with options:", options);

    let order;
    try {
      const razorpay = getRazorpayInstance();
      order = await razorpay.orders.create(options);
      console.log("Razorpay order created successfully:", order.id);
    } catch (razorpayError) {
      console.error("Razorpay API error:", razorpayError);
      console.error("Razorpay error details:", {
        message: razorpayError.message,
        description: razorpayError.error?.description,
        code: razorpayError.error?.code,
        statusCode: razorpayError.statusCode,
      });
      return res.status(500).json({
        success: false,
        error: "Failed to create payment order with gateway",
        details: razorpayError.error?.description || razorpayError.message,
      });
    }

    console.log("Updating recharge request with order ID...");
    // Update recharge request with gateway order ID
    const { error: updateError } = await supabase
      .from("wallet_recharge_requests")
      .update({
        gateway_order_id: order.id,
        status: "processing",
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

    console.log("Order creation successful, sending response");
    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      recharge_request_id: rechargeRequestId,
    });
  } catch (error) {
    console.error("Wallet recharge order creation error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      error: "Wallet recharge order creation failed",
      details: error.message,
    });
  }
};

// Verify wallet recharge payment and credit amount
export const verifyWalletRechargePayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      recharge_request_id,
    } = req.body;

    console.log("Verifying wallet recharge payment:", {
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      recharge_request_id,
    });

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "User authentication required" });
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.log("Invalid signature:", {
        generatedSignature,
        razorpay_signature,
      });
      return res
        .status(400)
        .json({ success: false, error: "Invalid payment signature" });
    }

    // Get recharge request
    const { data: rechargeRequest, error: requestError } = await supabase
      .from("wallet_recharge_requests")
      .select(
        `
                *,
                wallet:user_wallets(*)
            `
      )
      .eq("id", recharge_request_id)
      .eq("user_id", userId)
      .eq("gateway_order_id", razorpay_order_id)
      .single();

    if (requestError || !rechargeRequest) {
      console.error("Recharge request not found:", requestError);
      return res
        .status(404)
        .json({ success: false, error: "Recharge request not found" });
    }

    if (rechargeRequest.status === "completed") {
      return res
        .status(400)
        .json({ success: false, error: "Payment already processed" });
    }

    // Update recharge request with payment details
    const { error: updateRequestError } = await supabase
      .from("wallet_recharge_requests")
      .update({
        gateway_payment_id: razorpay_payment_id,
        gateway_signature: razorpay_signature,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", recharge_request_id);

    if (updateRequestError) {
      console.error("Error updating recharge request:", updateRequestError);
      return res
        .status(500)
        .json({ success: false, error: "Failed to update payment status" });
    }

    // Credit amount to wallet using stored procedure
    const { data: result, error: creditError } = await supabase.rpc(
      "update_wallet_balance",
      {
        p_wallet_id: rechargeRequest.wallet.id,
        p_amount: rechargeRequest.amount,
        p_is_credit: true,
        p_transaction_type_id: 1, // RECHARGE
        p_reference_id: razorpay_payment_id,
        p_reference_type: "payment",
        p_description: `Wallet recharge via Razorpay - Payment ID: ${razorpay_payment_id}`,
        p_created_by: userId,
      }
    );

    if (creditError || !result.success) {
      console.error("Error crediting wallet:", creditError, result);

      // Revert recharge request status
      await supabase
        .from("wallet_recharge_requests")
        .update({
          status: "failed",
          failure_reason:
            result?.error || creditError?.message || "Wallet credit failed",
        })
        .eq("id", recharge_request_id);

      return res.status(500).json({
        success: false,
        error:
          result?.error || creditError?.message || "Failed to credit wallet",
      });
    }

    console.log("Wallet recharge successful:", {
      transactionId: result.transaction_id,
      newBalance: result.new_balance,
    });

    return res.json({
      success: true,
      message: "Wallet recharged successfully",
      transaction_id: result.transaction_id,
      old_balance: result.old_balance,
      new_balance: result.new_balance,
      amount_credited: rechargeRequest.amount,
    });
  } catch (error) {
    console.error("Wallet recharge verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Payment verification failed",
      details: error.message,
    });
  }
};

// Handle webhook for automatic wallet recharge processing
export const handleWalletRechargeWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    if (!webhookSecret) {
      console.warn("Webhook secret not configured");
      return res.status(200).json({ success: true });
    }

    // Verify webhook signature
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (generatedSignature !== signature) {
      console.error("Invalid webhook signature");
      return res
        .status(400)
        .json({ success: false, error: "Invalid signature" });
    }

    const { event, payload } = req.body;

    if (event === "payment.captured") {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      console.log("Webhook: Payment captured for order:", orderId);

      // Check if this is a wallet recharge
      if (payment.notes && payment.notes.purpose === "wallet_recharge") {
        const rechargeRequestId = payment.notes.recharge_request_id;
        const userId = payment.notes.user_id;

        // Get recharge request
        const { data: rechargeRequest, error } = await supabase
          .from("wallet_recharge_requests")
          .select(
            `
                        *,
                        wallet:user_wallets(*)
                    `
          )
          .eq("id", rechargeRequestId)
          .eq("gateway_order_id", orderId)
          .single();

        if (error || !rechargeRequest) {
          console.error("Webhook: Recharge request not found:", error);
          return res.status(200).json({ success: true });
        }

        if (rechargeRequest.status === "completed") {
          console.log("Webhook: Payment already processed");
          return res.status(200).json({ success: true });
        }

        // Credit wallet
        const { data: result, error: creditError } = await supabase.rpc(
          "update_wallet_balance",
          {
            p_wallet_id: rechargeRequest.wallet.id,
            p_amount: rechargeRequest.amount,
            p_is_credit: true,
            p_transaction_type_id: 1, // RECHARGE
            p_reference_id: paymentId,
            p_reference_type: "payment",
            p_description: `Wallet recharge via webhook - Payment ID: ${paymentId}`,
            p_created_by: userId,
          }
        );

        if (!creditError && result.success) {
          // Update recharge request
          await supabase
            .from("wallet_recharge_requests")
            .update({
              gateway_payment_id: paymentId,
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("id", rechargeRequestId);

          console.log("Webhook: Wallet recharged successfully");
        } else {
          console.error("Webhook: Wallet credit failed:", creditError, result);

          await supabase
            .from("wallet_recharge_requests")
            .update({
              status: "failed",
              failure_reason:
                result?.error ||
                creditError?.message ||
                "Webhook processing failed",
            })
            .eq("id", rechargeRequestId);
        }
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res
      .status(500)
      .json({ success: false, error: "Webhook processing failed" });
  }
};
