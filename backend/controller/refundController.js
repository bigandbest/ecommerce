// controllers/refundController.js
import { supabase } from "../config/supabaseClient.js";
import {
  createRefundNotification,
  createAdminRefundNotification,
} from "./NotificationHelpers.js";

// Create refund request for cancelled prepaid orders
export const createRefundRequest = async (req, res) => {
  try {
    const {
      orderId,
      refundType = "order_cancellation",
      bankDetails,
    } = req.body;
    const userId = req.user?.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
      });
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if order belongs to user (unless admin)
    if (userId && order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized to create refund for this order",
      });
    }

    // Check if order is eligible for refund
    if (order.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        error: "Only cancelled orders are eligible for refund",
      });
    }

    // Check if order was prepaid
    if (order.payment_method !== "prepaid") {
      return res.status(400).json({
        success: false,
        error: "Only prepaid orders are eligible for refund",
      });
    }

    // Check if refund request already exists
    const { data: existingRefund } = await supabase
      .from("refund_requests")
      .select("id")
      .eq("order_id", orderId)
      .single();

    if (existingRefund) {
      return res.status(400).json({
        success: false,
        error: "Refund request already exists for this order",
      });
    }

    // Calculate refund amount (full order amount for cancellations)
    const refundAmount = parseFloat(order.total);

    // Create refund request
    const refundData = {
      order_id: orderId,
      user_id: order.user_id,
      refund_amount: refundAmount,
      refund_type: refundType,
      payment_method: order.payment_method,
      original_payment_id: order.payment_id,
      status: "pending",
    };

    // Add bank details if provided
    if (bankDetails) {
      refundData.bank_account_holder_name = bankDetails.accountHolderName;
      refundData.bank_account_number = bankDetails.accountNumber;
      refundData.bank_ifsc_code = bankDetails.ifscCode;
      refundData.bank_name = bankDetails.bankName;
      refundData.refund_mode = "bank_transfer";
    } else {
      // Default to wallet refund if no bank details
      refundData.refund_mode = "wallet";
    }

    const { data: refundRequest, error: refundError } = await supabase
      .from("refund_requests")
      .insert(refundData)
      .select()
      .single();

    if (refundError) {
      return res.status(500).json({
        success: false,
        error: refundError.message,
      });
    }

    // Get user details for notifications
    const { data: userData } = await supabase
      .from("users")
      .select("name, email")
      .eq("id", order.user_id)
      .single();

    // Create notifications
    try {
      await createRefundNotification(
        order.user_id,
        orderId,
        "requested",
        refundAmount
      );

      await createAdminRefundNotification(
        orderId,
        userData?.name || "Unknown User",
        refundAmount,
        refundType
      );
    } catch (notificationError) {
      console.error("Error creating refund notifications:", notificationError);
      // Don't fail the entire operation if notifications fail
    }

    res.json({
      success: true,
      message: "Refund request created successfully",
      refundRequest: {
        id: refundRequest.id,
        orderId: orderId,
        amount: refundAmount,
        status: "pending",
        refundMode: refundData.refund_mode,
      },
    });
  } catch (error) {
    console.error("Create refund request error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Get all refund requests (admin)
export const getAllRefundRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, refundType } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("refund_requests")
      .select(
        `
        *,
        order:orders(id, total, created_at),
        user:users(id, name, email, phone),
        processed_by_user:processed_by(name, email)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (refundType) {
      query = query.eq("refund_type", refundType);
    }

    const { data: refundRequests, error, count } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      refundRequests,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get refund requests error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Update refund request status (admin)
export const updateRefundRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user?.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const validStatuses = [
      "pending",
      "approved",
      "processing",
      "completed",
      "rejected",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    // Get current refund request
    const { data: refundRequest, error: fetchError } = await supabase
      .from("refund_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !refundRequest) {
      return res.status(404).json({
        success: false,
        error: "Refund request not found",
      });
    }

    // Update refund request
    const updateData = {
      status,
      admin_notes: adminNotes,
      processed_by: adminId,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed" || status === "processing") {
      updateData.processed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("refund_requests")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: updateError.message,
      });
    }

    // If refund is completed and mode is wallet, add money to user's wallet
    if (status === "completed" && refundRequest.refund_mode === "wallet") {
      await processWalletRefund(
        refundRequest.user_id,
        refundRequest.refund_amount,
        refundRequest.order_id,
        adminId
      );
    }

    // Create notification for user
    try {
      await createRefundNotification(
        refundRequest.user_id,
        refundRequest.order_id,
        status,
        refundRequest.refund_amount
      );
    } catch (notificationError) {
      console.error("Error creating refund notification:", notificationError);
    }

    res.json({
      success: true,
      message: `Refund request ${status} successfully`,
    });
  } catch (error) {
    console.error("Update refund request status error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

// Helper function to process wallet refund
const processWalletRefund = async (userId, amount, orderId, adminId) => {
  try {
    // Get current wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError) {
      console.error("Error fetching wallet for refund:", walletError);
      return;
    }

    const currentBalance = parseFloat(wallet.balance);
    const refundAmount = parseFloat(amount);
    const newBalance = currentBalance + refundAmount;

    // Update wallet balance
    const { error: updateError } = await supabase
      .from("user_wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating wallet balance for refund:", updateError);
      return;
    }

    // Record transaction
    await supabase.from("wallet_transactions").insert({
      user_id: userId,
      transaction_type: "credit",
      amount: refundAmount,
      balance_before: currentBalance,
      balance_after: newBalance,
      description: `Refund for cancelled order #${orderId}`,
      reference_type: "refund",
      reference_id: orderId,
      admin_id: adminId,
      status: "completed",
    });
  } catch (error) {
    console.error("Process wallet refund error:", error);
  }
};

// Get user's refund requests
export const getUserRefundRequests = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const {
      data: refundRequests,
      error,
      count,
    } = await supabase
      .from("refund_requests")
      .select(
        `
        *,
        order:orders(id, total, created_at)
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      refundRequests,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get user refund requests error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
