// controllers/returnOrderController.js
import { supabase } from "../config/supabaseClient.js";

// Helper function to calculate days since order delivery
const calculateDaysSinceDelivery = (orderDate, orderStatus) => {
  if (orderStatus !== "delivered") return -1;
  const deliveryDate = new Date(orderDate);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - deliveryDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
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

    if (order.status === "delivered") {
      const daysSinceDelivery = calculateDaysSinceDelivery(
        order.created_at,
        order.status
      );
      eligibility.days_since_delivery = daysSinceDelivery;

      if (daysSinceDelivery <= 7) {
        eligibility.can_return = true;
        eligibility.reason = `Product can be returned within 7 days of delivery. ${
          7 - daysSinceDelivery
        } days remaining.`;
      } else {
        eligibility.reason =
          "Return period has expired. Products can only be returned within 7 days of delivery.";
      }
    } else if (["pending", "processing", "shipped"].includes(order.status)) {
      eligibility.can_cancel = true;
      eligibility.reason =
        "Order can be cancelled as it hasn't been delivered yet.";
    } else {
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
      .select("status, created_at")
      .eq("id", order_id)
      .single();

    let isEligible = false;
    if (return_type === "return" && eligibilityCheck.status === "delivered") {
      const daysSince = calculateDaysSinceDelivery(
        eligibilityCheck.created_at,
        eligibilityCheck.status
      );
      isEligible = daysSince <= 7;
    } else if (
      return_type === "cancellation" &&
      ["pending", "processing", "shipped"].includes(eligibilityCheck.status)
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
        error: "Invalid status",
      });
    }

    const updateData = {
      status,
      admin_notes,
      updated_at: new Date().toISOString(),
    };

    if (admin_id) updateData.admin_id = admin_id;
    if (status === "completed")
      updateData.processed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("return_orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.json({
      success: true,
      return_request: data,
      message: "Return request updated successfully",
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
