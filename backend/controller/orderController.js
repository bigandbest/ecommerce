// controllers/orderController.js
import { supabase } from "../config/supabaseClient.js";
import crypto from "crypto";
import {
  createOrderNotification,
  createAdminOrderNotification,
  createAdminCancelNotification,
} from "./NotificationHelpers.js";

/** Get all orders (admin usage) */
export const getAllOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("orders")
    .select(`
      *,
      users(name, email, phone),
      order_items(
        id,
        product_id,
        quantity,
        price,
        is_bulk_order,
        bulk_range,
        original_price
      )
    `, { count: 'exact' })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error)
    return res.status(500).json({ success: false, error: error.message });
  
  return res.json({ 
    success: true, 
    orders: data,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  });
};

/** Update an order’s status */
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminnotes = "" } = req.body;

  // Get order details first to get user_id
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError)
    return res.status(500).json({ success: false, error: fetchError.message });

  const { error } = await supabase
    .from("orders")
    .update({ status, adminnotes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error)
    return res.status(500).json({ success: false, error: error.message });

  // Create notification for status update
  await createOrderNotification(order.user_id, id, status, adminnotes);

  return res.json({ success: true });
};

/** Get orders for a specific user */
export const getUserOrders = async (req, res) => {
  const { user_id } = req.params;
  const { limit = 10, offset = 0 } = req.query; // Add pagination
  console.log(
    "Getting orders for user_id:",
    user_id,
    "limit:",
    limit,
    "offset:",
    offset
  );

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, status, created_at, payment_method, address, subtotal, shipping, total, order_items(id, quantity, price, products(id, name, image))"
    )
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1); // Add pagination

  console.log("Database query result:", { data, error });
  if (error) {
    console.error("Database error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
  console.log("Sending response with orders count:", data?.length || 0);
  return res.json({ success: true, orders: data });
};

/** Place order with a flat address string */
export const placeOrder = async (req, res) => {
  const { user_id, items, subtotal, shipping, total, address, payment_method } =
    req.body;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([{ user_id, subtotal, shipping, total, address, payment_method }])
    .select()
    .single();

  if (orderError)
    return res.status(500).json({ success: false, error: orderError.message });

  const orderItemsToInsert = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsToInsert);

  if (itemsError)
    return res.status(500).json({ success: false, error: itemsError.message });

  // Optional: clear user's cart (no response check here)
  await supabase.from("cart_items").delete().eq("user_id", user_id);

  return res.json({ success: true, order });
};

export const placeOrderWithDetailedAddress = async (req, res) => {
  const {
    user_id,
    items,
    subtotal,
    shipping,
    total,
    detailedAddress, // The manually selected address
    payment_method,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    gpsLocation, // 👈 The new GPS data from the map selection
  } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: "Invalid signature" });
  }

  // This part remains the same, creating a string from the manual address
  const addressString = [
    detailedAddress.houseNumber && detailedAddress.streetAddress
      ? `${detailedAddress.houseNumber} ${detailedAddress.streetAddress}`
      : detailedAddress.streetAddress,
    detailedAddress.suiteUnitFloor,
    detailedAddress.locality,
    detailedAddress.area,
    detailedAddress.city,
    detailedAddress.state,
    detailedAddress.postalCode,
    detailedAddress.country || "India",
    detailedAddress.landmark ? `Near ${detailedAddress.landmark}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const orderData = {
    user_id,
    subtotal,
    shipping,
    total,
    address: addressString, // The formatted manual address
    payment_method,
    // Fields from the manually selected address
    shipping_house_number: detailedAddress.houseNumber,
    shipping_street_address: detailedAddress.streetAddress,
    shipping_suite_unit_floor: detailedAddress.suiteUnitFloor,
    shipping_locality: detailedAddress.locality,
    shipping_area: detailedAddress.area,
    shipping_city: detailedAddress.city,
    shipping_state: detailedAddress.state,
    shipping_postal_code: detailedAddress.postalCode,
    shipping_country: detailedAddress.country || "India",
    shipping_landmark: detailedAddress.landmark,
    // Razorpay details
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    // 👇 New fields from the GPS map selection
    shipping_latitude: gpsLocation?.latitude || null,
    shipping_longitude: gpsLocation?.longitude || null,
    shipping_gps_address: gpsLocation?.formatted_address || null,
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert([orderData])
    .select()
    .single();

  if (orderError) {
    console.error("Supabase order insert error:", orderError);
    return res.status(500).json({ success: false, error: orderError.message });
  }

  const orderItemsToInsert = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id || item.id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsToInsert);

  if (itemsError) {
    // Optional: You might want to delete the order if item insertion fails (rollback)
    console.error("Supabase order items insert error:", itemsError);
    return res.status(500).json({ success: false, error: itemsError.message });
  }

  // Clear the user's cart after successful order placement
  await supabase.from("cart_items").delete().eq("user_id", user_id);

  // Get user details for admin notification
  const { data: userData } = await supabase
    .from("users")
    .select("name")
    .eq("id", user_id)
    .single();

  // Create notifications for new order
  await createOrderNotification(user_id, order.id, "pending");
  await createAdminOrderNotification(order.id, userData?.name, total);

  return res.json({ success: true, order });
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {}; // Handle case where req.body is undefined

    console.log(
      "Cancelling order:",
      id,
      "Reason:",
      reason || "No reason provided"
    );

    // Get order details first
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("user_id, status, payment_method, total, razorpay_payment_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching order:", fetchError);
      return res
        .status(500)
        .json({ success: false, error: fetchError.message });
    }

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Check if order can be cancelled
    if (order.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, error: "Order is already cancelled" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        error: "Delivered orders cannot be cancelled",
      });
    }

    // Update order status
    const { error } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating order status:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Get user details for notifications
    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", order.user_id)
      .single();

    // Create notifications for cancellation
    try {
      await createOrderNotification(order.user_id, id, "cancelled", reason);
      await createAdminCancelNotification(
        id,
        userData?.name || "Unknown User",
        reason
      );
    } catch (notificationError) {
      console.error("Error creating notifications:", notificationError);
      // Don't fail the entire operation if notifications fail
    }

    // Auto-create refund request for prepaid orders
    if (order.payment_method === "prepaid") {
      try {
        const refundData = {
          order_id: id,
          user_id: order.user_id,
          refund_amount: parseFloat(order.total),
          refund_type: "order_cancellation",
          payment_method: order.payment_method,
          original_payment_id: order.razorpay_payment_id,
          refund_mode: "wallet", // Default to wallet refund for auto-created requests
          status: "pending",
        };

        const { data: refundRequest, error: refundError } = await supabase
          .from("refund_requests")
          .insert(refundData)
          .select()
          .single();

        if (!refundError) {
          console.log("Auto-created refund request:", refundRequest.id);

          // Create admin notification for refund request
          await supabase.from("notifications").insert({
            type: "admin",
            title: "New Refund Request",
            message: `Auto-generated refund request for cancelled order #${id}. Amount: ₹${order.total}`,
            related_type: "refund",
            related_id: refundRequest.id,
            read: false,
          });
        } else {
          console.error("Error creating refund request:", refundError);
        }
      } catch (refundError) {
        console.error("Error auto-creating refund request:", refundError);
        // Don't fail the entire operation if refund creation fails
      }
    }

    console.log("Order cancelled successfully:", id);
    return res.json({
      success: true,
      message: "Order cancelled successfully",
      refundCreated: order.payment_method === "prepaid",
    });
  } catch (error) {
    console.error("Unexpected error in cancelOrder:", error);
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred while cancelling the order",
    });
  }
};

export const deleteOrderById = async (req, res) => {
  const { id } = req.params;

  // Step 1: Delete all order items for this order
  const { error: itemError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", id);

  if (itemError) {
    return res.status(500).json({ success: false, error: itemError.message });
  }

  // Step 2: Delete the order
  const { error: orderError } = await supabase
    .from("orders")
    .delete()
    .eq("id", id);

  if (orderError) {
    return res.status(500).json({ success: false, error: orderError.message });
  }

  return res.json({
    success: true,
    message: "Order and its items deleted successfully.",
  });
};

/** Get order tracking timeline */
export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, error: "Order ID required" });
    }

    // Fetch order with related items
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `id, status, created_at, updated_at, order_items(id, quantity, price, products(id, name))`
      )
      .eq("id", orderId)
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Build a simple timeline. This is intentionally simple — it can be extended to use courier webhooks.
    const timeline = [];

    // Order placed
    if (order.created_at) {
      timeline.push({
        key: "placed",
        title: "Order Placed",
        timestamp: order.created_at,
        meta: null,
      });
    }

    // Map status to steps
    const status = order.status || "pending";

    if (
      status === "confirmed" ||
      status === "shipped" ||
      status === "delivered"
    ) {
      timeline.push({
        key: "confirmed",
        title: "Order Confirmed",
        timestamp: order.updated_at || null,
      });
    }

    if (status === "shipped" || status === "delivered") {
      timeline.push({
        key: "shipped",
        title: "Shipped",
        timestamp: order.updated_at || null,
      });
    }

    if (status === "delivered") {
      timeline.push({
        key: "delivered",
        title: "Delivered",
        timestamp: order.updated_at || null,
      });
    }

    if (status === "cancelled") {
      timeline.push({
        key: "cancelled",
        title: "Cancelled",
        timestamp: order.updated_at || null,
      });
    }

    // Remove duplicates & keep order
    const seen = new Set();
    const deduped = [];
    for (const item of timeline) {
      const k = item.key + (item.timestamp || "");
      if (!seen.has(k)) {
        seen.add(k);
        deduped.push(item);
      }
    }

    return res.json({ success: true, orderId: order.id, tracking: deduped });
  } catch (err) {
    console.error("getOrderTracking error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
