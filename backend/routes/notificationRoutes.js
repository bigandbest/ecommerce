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

export default router;
