// controllers/returnOrderController.js
import { supabase } from "../config/supabaseClient.js";
import {
  createReturnNotification,
  createAdminReturnNotification,
  createNotificationHelper,
} from "./NotificationHelpers.js";

// Helper function to calculate days since order delivery
const calculateDaysSinceDelivery = (orderDate, orderStatus) => {
  if (orderStatus.toLowerCase() !== "delivered") return -1;
  if (!orderDate) return -1; // Handle null/undefined dates

  const deliveryDate = new Date(orderDate);
  const currentDate = new Date();

  // Check if date is valid
  if (isNaN(deliveryDate.getTime())) return -1;

  const diffTime = Math.abs(currentDate - deliveryDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  console.log("Date calculation debug:", {
    orderDate,
    deliveryDate: deliveryDate.toISOString(),
    currentDate: currentDate.toISOString(),
    diffTime,
    diffDays,
  });

  return diffDays;
};

// Helper function to generate notification messages
const getNotificationMessage = (status, return_type) => {
  const actionType = return_type === "cancellation" ? "cancellation" : "return";

  switch (status) {
    case "approved":
      return `Your ${actionType} request has been approved. Refund processing will begin shortly.`;
    case "rejected":
      return `Your ${actionType} request has been declined. Please contact support for more details.`;
    case "processing":
      return `Your ${actionType} request is being processed. Refund will be credited soon.`;
    case "completed":
      return `Your ${actionType} has been completed successfully. Refund amount has been credited to your account.`;
    default:
      return `Your ${actionType} request status has been updated to ${status}.`;
  }
};

// Test database connection and tables
export const testDatabase = async (req, res) => {
  try {
    // Test if return_orders table exists
    const { data: returnOrders, error: returnOrdersError } = await supabase
      .from("return_orders")
      .select("count", { count: "exact" })
      .limit(1);

    // Test if notifications table exists
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("count", { count: "exact" })
      .limit(1);

    return res.json({
      success: true,
      message: "Database connection test",
      tables: {
        return_orders: {
          exists: !returnOrdersError,
          error: returnOrdersError?.message,
          count: returnOrders?.[0]?.count || 0,
        },
        notifications: {
          exists: !notificationsError,
          error: notificationsError?.message,
          count: notifications?.[0]?.count || 0,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Check if order is eligible for return/cancellation
export const checkReturnEligibility = async (req, res) => {
  const { order_id } = req.params;

  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if already has return request
    const { data: existingReturn } = await supabase
      .from("return_orders")
      .select("id, status")
      .eq("order_id", order_id)
      .single();

    if (existingReturn) {
      return res.json({
        success: false,
        error: "Return request already exists",
        existing_return: existingReturn,
      });
    }

    let eligibility = {
      can_return: false,
      can_cancel: false,
      reason: "",
      days_since_delivery: 0,
    };

    if (order.status.toLowerCase() === "delivered") {
      // Use updated_at if available, otherwise fall back to created_at
      const deliveryDate = order.updated_at || order.created_at;
      const daysSinceDelivery = calculateDaysSinceDelivery(
        deliveryDate,
        order.status
      );
      eligibility.days_since_delivery = daysSinceDelivery;

      console.log("Order eligibility check:", {
        order_id: order.id,
        status: order.status,
        updated_at: order.updated_at,
        created_at: order.created_at,
        deliveryDate,
        daysSinceDelivery,
      });

      if (daysSinceDelivery <= 7 && daysSinceDelivery >= 0) {
        eligibility.can_return = true;
        eligibility.reason = `Product can be returned within 7 days of delivery. ${
          7 - daysSinceDelivery
        } days remaining.`;
      } else if (daysSinceDelivery > 7) {
        eligibility.reason =
          "Return period has expired. Products can only be returned within 7 days of delivery.";
      } else {
        eligibility.reason =
          "Unable to calculate delivery date for this order.";
      }
    } else if (
      ["pending", "processing", "shipped"].includes(order.status.toLowerCase())
    ) {
      eligibility.can_cancel = true;
      eligibility.reason =
        "Order can be cancelled as it hasn't been delivered yet.";
    } else {
      console.log("Order status not eligible:", order.status);
      eligibility.reason =
        "This order is not eligible for return or cancellation.";
    }

    return res.json({
      success: true,
      order_status: order.status,
      eligibility,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create return/cancellation request
export const createReturnRequest = async (req, res) => {
  const {
    order_id,
    user_id,
    return_type, // 'return' or 'cancellation'
    reason,
    additional_details,
    bank_account_holder_name,
    bank_account_number,
    bank_ifsc_code,
    bank_name,
    items = [], // For partial returns
  } = req.body;

  try {
    // Validate required fields
    if (
      !order_id ||
      !user_id ||
      !return_type ||
      !reason ||
      !bank_account_holder_name ||
      !bank_account_number ||
      !bank_ifsc_code ||
      !bank_name
    ) {
      return res.status(400).json({
        success: false,
        error: "All required fields must be provided",
      });
    }

    // Check if order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", order_id)
      .eq("user_id", user_id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({
        success: false,
        error: "Order not found or doesn't belong to user",
      });
    }

    // Check eligibility
    const eligibilityResponse = await checkReturnEligibility(
      { params: { order_id } },
      {
        json: (data) => data,
      }
    );

    // Re-fetch eligibility properly
    const { data: eligibilityCheck } = await supabase
      .from("orders")
      .select("status, created_at, updated_at")
      .eq("id", order_id)
      .single();

    let isEligible = false;
    if (
      return_type === "return" &&
      eligibilityCheck.status.toLowerCase() === "delivered"
    ) {
      const daysSince = calculateDaysSinceDelivery(
        eligibilityCheck.updated_at,
        eligibilityCheck.status
      );
      isEligible = daysSince <= 7;
    } else if (
      return_type === "cancellation" &&
      ["pending", "processing", "shipped"].includes(
        eligibilityCheck.status.toLowerCase()
      )
    ) {
      isEligible = true;
    }

    if (!isEligible) {
      return res.status(400).json({
        success: false,
        error: "Order is not eligible for this type of request",
      });
    }

    // Calculate refund amount (for now, full order amount minus any processing fees)
    const refund_amount =
      return_type === "cancellation"
        ? order.total
        : order.total - (order.shipping || 0); // Subtract shipping for returns

    // Create return request
    const { data: returnOrder, error: returnError } = await supabase
      .from("return_orders")
      .insert([
        {
          order_id,
          user_id,
          return_type,
          reason,
          additional_details,
          bank_account_holder_name,
          bank_account_number,
          bank_ifsc_code,
          bank_name,
          refund_amount,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (returnError) {
      return res.status(500).json({
        success: false,
        error: returnError.message,
      });
    }

    // If partial return, add return items
    if (items.length > 0) {
      const returnItems = items.map((item) => ({
        return_order_id: returnOrder.id,
        order_item_id: item.order_item_id,
        quantity: item.quantity,
        return_reason: item.reason,
      }));

      const { error: itemsError } = await supabase
        .from("return_order_items")
        .insert(returnItems);

      if (itemsError) {
        // Rollback return order if items insertion fails
        await supabase.from("return_orders").delete().eq("id", returnOrder.id);
        return res.status(500).json({
          success: false,
          error: "Failed to create return items: " + itemsError.message,
        });
      }
    }

    // Get user details for admin notification
    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", user_id)
      .single();

    // Create notifications for return request
    await createReturnNotification(user_id, order_id, "requested", return_type);
    await createAdminReturnNotification(order_id, userData?.name, return_type);

    return res.json({
      success: true,
      return_order: returnOrder,
      message: "Return request created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get user's return requests
export const getUserReturnRequests = async (req, res) => {
  const { user_id } = req.params;
  const { limit = 10, offset = 0 } = req.query;

  try {
    const { data, error } = await supabase
      .from("return_orders_detailed")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      return_requests: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all return requests (admin)
export const getAllReturnRequests = async (req, res) => {
  const { limit = 50, offset = 0, status } = req.query;

  try {
    let query = supabase
      .from("return_orders_detailed")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      return_requests: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update return request status (admin)
export const updateReturnRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes, admin_id } = req.body;

  try {
    console.log("Updating return request:", {
      id,
      status,
      admin_notes,
      admin_id,
    });

    // Validate required fields
    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Return request ID is required",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "processing",
      "completed",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Check if return order exists first
    const { data: existingReturn, error: fetchError } = await supabase
      .from("return_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching return order:", fetchError);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch return order",
        details: fetchError.message,
      });
    }

    if (!existingReturn) {
      return res.status(404).json({
        success: false,
        error: "Return order not found",
      });
    }

    const updateData = {
      status,
      admin_notes,
      updated_at: new Date().toISOString(),
    };

    // Only add admin_id if it's a valid UUID format
    if (admin_id && admin_id !== "admin-user-id") {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(admin_id)) {
        updateData.admin_id = admin_id;
      } else {
        console.warn("Invalid admin_id UUID format:", admin_id);
        // Don't include admin_id in update if it's not a valid UUID
      }
    }

    if (status === "completed")
      updateData.processed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("return_orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating return order:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
        details: error,
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Return order not found",
      });
    }

    // Create detailed notification for status update
    console.log("Creating notification for user:", data.user_id, "status:", status);
    const notificationMessage = getNotificationMessage(status, data.return_type);
    
    try {
      // Create notification using helper
      const notification = await createNotificationHelper(
        data.user_id,
        `${data.return_type === 'cancellation' ? 'Cancellation' : 'Return'} Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        notificationMessage,
        'return',
        data.order_id
      );
      
      if (notification) {
        console.log("✅ Notification created successfully:", notification.id);
      } else {
        console.log("❌ Failed to create notification");
      }
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }

    return res.json({
      success: true,
      return_request: data,
      message: "Return request updated successfully",
      notification_sent: true
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get return request details
export const getReturnRequestDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("return_orders_detailed")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: "Return request not found",
      });
    }

    // Get return items if any
    const { data: returnItems, error: itemsError } = await supabase
      .from("return_order_items")
      .select(
        `
        *,
        order_items(
          *,
          products(id, name, image)
        )
      `
      )
      .eq("return_order_id", id);

    if (itemsError) {
      console.error("Error fetching return items:", itemsError);
    }

    return res.json({
      success: true,
      return_request: {
        ...data,
        return_items: returnItems || [],
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete return request (admin only, for spam/invalid requests)
export const deleteReturnRequest = async (req, res) => {
  const { id } = req.params;

  try {
    // First delete return items
    await supabase
      .from("return_order_items")
      .delete()
      .eq("return_order_id", id);

    // Then delete return request
    const { error } = await supabase
      .from("return_orders")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      message: "Return request deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
