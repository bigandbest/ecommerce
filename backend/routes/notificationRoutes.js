import { Router } from "express";
const router = Router();
import { createNotification, getNotifications, updateNotification, deleteNotification } from "../controller/NotificationController.js";


// Routes
router.post("/create", createNotification);   // Admin only
router.get("/collect", getNotifications);// All users
router.put("/update/:id", updateNotification); // Admin only
router.delete("/delete/:id", deleteNotification); // Admin only

export default router;
