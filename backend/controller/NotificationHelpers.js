// Helper functions for creating different types of notifications
import { supabase } from "../config/supabaseClient.js";

/**
 * Generic function to create a notification
 * @param {string} user_id - User ID (null for admin notifications)
 * @param {string} heading - Notification title
 * @param {string} description - Notification message
 * @param {string} related_type - Type of notification (order, refund, return, product, etc.)
 * @param {string} related_id - Related entity ID
 * @param {string} notification_type - user or admin
 */
export const createNotificationHelper = async (
  user_id,
  heading,
  description,
  related_type,
  related_id,
  notification_type = "user"
) => {
  try {
    // Add user ID to description for user-specific notifications (for backward compatibility)
    const finalDescription =
      notification_type === "user"
        ? `[USER:${user_id}] ${description}`
        : description;

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: notification_type === "user" ? user_id : null,
          heading,
          description: finalDescription,
          related_id,
          related_type,
          notification_type,
          expiry_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Error creating notification:", error);
      return null;
    }

    console.log("Notification created successfully:", data[0]);
    return data[0];
  } catch (error) {
    console.error("Unexpected error creating notification:", error);
    return null;
  }
};

// USER NOTIFICATIONS (visible to specific users)

/**
 * Create order-related notifications for users
 */
export const createOrderNotification = async (
  user_id,
  order_id,
  status,
  additional_info = ""
) => {
  const statusMessages = {
    pending: "Your order has been placed successfully and is being processed.",
    confirmed:
      "Your order has been confirmed and is being prepared for shipment.",
    processing: "Your order is currently being processed.",
    shipped: "Your order has been shipped and is on its way to you.",
    delivered: "Your order has been delivered successfully.",
    cancelled:
      "Your order has been cancelled." +
      (additional_info ? ` Reason: ${additional_info}` : ""),
    refunded: "Your order has been refunded successfully.",
  };

  const heading = `Order #${order_id} ${
    status.charAt(0).toUpperCase() + status.slice(1)
  }`;
  const description =
    statusMessages[status] ||
    `Your order status has been updated to ${status}.`;

  return await createNotificationHelper(
    user_id,
    heading,
    description,
    "order",
    order_id
  );
};

/**
 * Create refund-related notifications for users
 */
export const createRefundNotification = async (
  user_id,
  order_id,
  refund_status,
  refund_amount = null
) => {
  const statusMessages = {
    requested: "Your refund request has been submitted and is under review.",
    approved:
      "Your refund request has been approved. Processing will begin shortly.",
    processing: "Your refund is being processed.",
    completed: `Your refund has been completed successfully.${
      refund_amount ? ` Amount: ₹${refund_amount}` : ""
    }`,
    rejected:
      "Your refund request has been rejected. Please contact support for more details.",
  };

  const heading = `Refund for Order #${order_id}`;
  const description =
    statusMessages[refund_status] ||
    `Your refund status has been updated to ${refund_status}.`;

  return await createNotificationHelper(
    user_id,
    heading,
    description,
    "refund",
    order_id
  );
};

/**
 * Create return-related notifications for users
 */
export const createReturnNotification = async (
  user_id,
  order_id,
  return_status,
  return_type = "return"
) => {
  const actionType = return_type === "cancellation" ? "cancellation" : "return";
  const statusMessages = {
    requested: `Your ${actionType} request has been submitted and is under review.`,
    approved: `Your ${actionType} request has been approved.`,
    rejected: `Your ${actionType} request has been rejected. Please contact support for more details.`,
    processing: `Your ${actionType} is being processed.`,
    completed: `Your ${actionType} has been completed successfully.`,
  };

  const heading = `${
    actionType.charAt(0).toUpperCase() + actionType.slice(1)
  } for Order #${order_id}`;
  const description =
    statusMessages[return_status] ||
    `Your ${actionType} status has been updated to ${return_status}.`;

  return await createNotificationHelper(
    user_id,
    heading,
    description,
    "return",
    order_id
  );
};

/**
 * Create product-related notifications for users
 */
export const createProductNotification = async (
  user_id,
  product_id,
  message_type,
  product_name = "",
  additional_info = ""
) => {
  const messages = {
    back_in_stock: `Good news! ${product_name} is back in stock.`,
    price_drop: `Price drop alert! ${product_name} is now available at a lower price.`,
    low_stock: `Hurry up! Only a few items left for ${product_name}.`,
    discontinued: `${product_name} has been discontinued.`,
    updated: `${product_name} has been updated with new features.`,
  };

  const heading =
    message_type === "back_in_stock"
      ? "Product Back in Stock"
      : message_type === "price_drop"
      ? "Price Drop Alert"
      : message_type === "low_stock"
      ? "Low Stock Alert"
      : message_type === "discontinued"
      ? "Product Discontinued"
      : "Product Update";

  const description =
    messages[message_type] || `Update for ${product_name}: ${additional_info}`;

  return await createNotificationHelper(
    user_id,
    heading,
    description,
    "product",
    product_id
  );
};

// ADMIN NOTIFICATIONS (visible to admin users)

/**
 * Create new order notification for admin
 */
export const createAdminOrderNotification = async (
  order_id,
  user_name,
  order_total
) => {
  const heading = `New Order Received - #${order_id}`;
  const description = `New order from ${
    user_name || "Customer"
  } for ₹${order_total}. Please review and process.`;

  return await createNotificationHelper(
    null,
    heading,
    description,
    "new_order",
    order_id,
    "admin"
  );
};

/**
 * Create refund request notification for admin
 */
export const createAdminRefundNotification = async (
  order_id,
  user_name,
  refund_amount
) => {
  const heading = `Refund Request - Order #${order_id}`;
  const description = `Refund requested by ${
    user_name || "Customer"
  } for ₹${refund_amount}. Please review.`;

  return await createNotificationHelper(
    null,
    heading,
    description,
    "refund_request",
    order_id,
    "admin"
  );
};

/**
 * Create return request notification for admin
 */
export const createAdminReturnNotification = async (
  order_id,
  user_name,
  return_type = "return"
) => {
  const actionType = return_type === "cancellation" ? "cancellation" : "return";
  const heading = `${
    actionType.charAt(0).toUpperCase() + actionType.slice(1)
  } Request - Order #${order_id}`;
  const description = `${
    actionType.charAt(0).toUpperCase() + actionType.slice(1)
  } requested by ${
    user_name || "Customer"
  } for order #${order_id}. Please review.`;

  return await createNotificationHelper(
    null,
    heading,
    description,
    "return_request",
    order_id,
    "admin"
  );
};

/**
 * Create cancel request notification for admin
 */
export const createAdminCancelNotification = async (
  order_id,
  user_name,
  reason = ""
) => {
  const heading = `Order Cancellation - #${order_id}`;
  const description = `Order cancelled by ${user_name || "Customer"}.${
    reason ? ` Reason: ${reason}` : ""
  }`;

  return await createNotificationHelper(
    null,
    heading,
    description,
    "cancel_request",
    order_id,
    "admin"
  );
};
