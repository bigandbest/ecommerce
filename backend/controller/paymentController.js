// controllers/paymentController.js
import Razorpay from "razorpay";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    console.log("Payment request received:", req.body);
    console.log("Razorpay credentials check:", {
      key_id: process.env.RAZORPAY_KEY_ID ? "Present" : "Missing",
      key_secret: process.env.RAZORPAY_KEY_SECRET ? "Present" : "Missing",
    });

    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      console.log("Invalid amount:", amount);
      return res
        .status(400)
        .json({ success: false, error: "Valid amount is required" });
    }

    const options = {
      amount: amount * 100, // convert to paisa
      currency: "INR",
      receipt: `receipt_${Math.floor(Math.random() * 1000000)}`,
      payment_capture: 1,
    };

    console.log("Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created successfully:", order.id);

    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });
    return res.status(500).json({
      success: false,
      error: "Razorpay order creation failed",
      details: error.message,
    });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    return res.json({ success: true, message: "Payment verified" });
  } else {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }
};

export const verifyRazorpaySignature = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res.json({ success: true, message: "Payment signature verified" });
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Invalid signature" });
  }
};

// Check if user has sufficient wallet balance
export const checkWalletBalance = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res
        .status(400)
        .json({ success: false, error: "User ID and amount are required" });
    }

    const { supabase } = await import("../config/supabaseClient.js");

    const { data: wallet, error } = await supabase
      .from("user_wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to fetch wallet balance" });
    }

    const hasBalance =
      wallet && parseFloat(wallet.balance) >= parseFloat(amount);

    return res.json({
      success: true,
      hasBalance,
      currentBalance: wallet?.balance || 0,
      requiredAmount: amount,
    });
  } catch (error) {
    console.error("Check wallet balance error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
