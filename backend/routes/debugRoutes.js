import express from "express";
import { supabase } from "../config/supabaseClient.js";
import { createNotificationHelper } from "../controller/NotificationHelpers.js";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is running!",
    timestamp: new Date().toISOString(),
    cors: "enabled",
  });
});

// Test notification creation
router.post("/test-notification", async (req, res) => {
  try {
    const { user_id, description } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    // Create test notification
    const notification = await createNotificationHelper(
      user_id,
      "Test Return Notification",
      description || "Your return request has been approved for testing.",
      "return",
      "test-order-id"
    );

    if (notification) {
      res.json({
        success: true,
        message: "Test notification created",
        notification,
      });
    } else {
      res.status(500).json({ error: "Failed to create notification" });
    }
  } catch (error) {
    console.error("Test notification error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add sample groups to Pet Care subcategory
router.post("/add-pet-groups", async (req, res) => {
  try {
    const petCareSubcategoryId = "ada8a78d-7ea1-4219-8794-f25eafa831a7";

    const sampleGroups = [
      {
        name: "Dog Food",
        description: "Premium dog food and treats",
        icon: "🐕",
        image_url: null,
        subcategory_id: petCareSubcategoryId,
        featured: true,
        active: true,
        sort_order: 0,
      },
      {
        name: "Cat Food",
        description: "Nutritious cat food and snacks",
        icon: "🐱",
        image_url: null,
        subcategory_id: petCareSubcategoryId,
        featured: true,
        active: true,
        sort_order: 1,
      },
      {
        name: "Pet Toys",
        description: "Fun toys for your pets",
        icon: "🎾",
        image_url: null,
        subcategory_id: petCareSubcategoryId,
        featured: false,
        active: true,
        sort_order: 2,
      },
      {
        name: "Pet Accessories",
        description: "Collars, leashes, and more",
        icon: "🦴",
        image_url: null,
        subcategory_id: petCareSubcategoryId,
        featured: false,
        active: true,
        sort_order: 3,
      },
    ];

    const { data, error } = await supabase.from("groups").insert(sampleGroups);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      message: "Pet Care groups added successfully",
      data,
    });
  } catch (error) {
    console.error("Add pet groups error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get all notifications for debugging
router.get("/notifications", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json({ success: true, notifications: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test return order notification flow
router.post("/test-return-notification", async (req, res) => {
  try {
    const { user_id, order_id, status } = req.body;

    if (!user_id || !order_id || !status) {
      return res
        .status(400)
        .json({ error: "user_id, order_id, and status are required" });
    }

    // Simulate return order status update notification
    const notification = await createNotificationHelper(
      user_id,
      `Return Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your return request has been ${status}. ${
        status === "approved"
          ? "Refund processing will begin shortly."
          : "Please contact support for more details."
      }`,
      "return",
      order_id
    );

    if (notification) {
      res.json({
        success: true,
        message: "Return notification created",
        notification,
      });
    } else {
      res.status(500).json({ error: "Failed to create notification" });
    }
  } catch (error) {
    console.error("Test return notification error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
