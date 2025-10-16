import { Router } from "express";
const router = Router();
import { supabase } from "../config/supabaseClient.js";
import {
  createNotification,
  getNotifications,
  updateNotification,
  deleteNotification,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createProductUpdateNotification,
  getAdminNotifications,
  getUnreadCount,
} from "../controller/NotificationController.js";

// Routes
router.post("/create", createNotification); // Admin only
router.get("/collect", getNotifications); // All users
router.put("/update/:id", updateNotification); // Admin only
router.delete("/delete/:id", deleteNotification); // Admin only

// User-specific notification routes
router.get("/user/:user_id", getUserNotifications); // Get user notifications
router.put("/read/:id", markNotificationRead); // Mark single notification as read
router.put("/read-all/:user_id", markAllNotificationsRead); // Mark all notifications as read

// Product update notification
router.post("/product-update", async (req, res) => {
  const { productId, updateType, oldValue, newValue } = req.body;
  const result = await createProductUpdateNotification(
    productId,
    updateType,
    oldValue,
    newValue
  );
  if (result.success) {
    res.json({
      success: true,
      message: `Notified ${result.notifiedUsers || 0} users`,
    });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// Test endpoint to create user-specific notification
router.post("/create-user-notification", async (req, res) => {
  try {
    const { user_id, heading, description, related_type = "test" } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, error: "user_id is required" });
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: user_id,
          heading: heading || "Test Order Notification",
          description: `[USER:${user_id}] ${
            description || "Your order has been processed successfully!"
          }`,
          related_type: related_type,
          related_id: `test-${Date.now()}`,
          notification_type: "user",
          is_read: false,
          expiry_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    console.log("Created test notification:", data);
    res.status(201).json({ success: true, notification: data });
  } catch (err) {
    console.error("Error creating test notification:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Test endpoint to create multiple sample notifications for a user
router.post("/create-sample-notifications", async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res
        .status(400)
        .json({ success: false, error: "user_id is required" });
    }

    const sampleNotifications = [
      {
        user_id: user_id,
        heading: "Order Placed Successfully",
        description: `[USER:${user_id}] Your order has been placed and is being processed.`,
        related_type: "order",
        related_id: `order-${Date.now()}`,
        notification_type: "user",
        is_read: false,
        expiry_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        user_id: user_id,
        heading: "Return Request Approved",
        description: `[USER:${user_id}] Your return request has been approved. Processing will begin shortly.`,
        related_type: "return",
        related_id: `return-${Date.now()}`,
        notification_type: "user",
        is_read: false,
        expiry_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        user_id: user_id,
        heading: "Payment Processed",
        description: `[USER:${user_id}] Your payment has been processed successfully.`,
        related_type: "payment",
        related_id: `payment-${Date.now()}`,
        notification_type: "user",
        is_read: true,
        expiry_date: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      },
    ];

    const { data, error } = await supabase
      .from("notifications")
      .insert(sampleNotifications)
      .select();

    if (error) throw error;

    console.log(
      `Created ${data.length} sample notifications for user ${user_id}`
    );
    res.status(201).json({
      success: true,
      message: `Created ${data.length} sample notifications`,
      notifications: data,
    });
  } catch (err) {
    console.error("Error creating sample notifications:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin notification routes
router.get("/admin", getAdminNotifications); // Get admin notifications
router.get("/unread-count/:user_id", getUnreadCount); // Get unread count for user

export default router;
