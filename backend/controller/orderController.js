// controllers/orderController.js
import { supabase } from "../config/supabaseClient.js";
import crypto from "crypto";

/** Get all orders (admin usage) */
export const getAllOrders = async (req, res) => {
  const { data, error } = await supabase
    .from("orders")
    .select("*, users(name, email, phone)") // 👈 join users table
    .order("created_at", { ascending: false });

  if (error)
    return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, orders: data });
};

/** Update an order’s status */
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, adminnotes = "" } = req.body;

  const { error } = await supabase
    .from("orders")
    .update({ status, adminnotes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error)
    return res.status(500).json({ success: false, error: error.message });
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

  return res.json({ success: true, order });
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("orders")
    .update({ 
      status: "cancelled", 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id);
    
  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, message: "Order cancelled successfully" });
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
