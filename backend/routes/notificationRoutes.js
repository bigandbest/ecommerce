import { Router } from "express";
const router = Router();
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
    const { user_id, heading, description } = req.body;

    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          heading: heading || "User-Specific Test Notification",
          description: description || "This notification is only for you!",
          expiry_date: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
          // We'll store user_id in description for now since column doesn't exist
          description: `[USER:${user_id}] ${
            description || "This notification is only for you!"
          }`,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, notification: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin notification routes
router.get("/admin", getAdminNotifications); // Get admin notifications
router.get("/unread-count/:user_id", getUnreadCount); // Get unread count for user

export default router;
