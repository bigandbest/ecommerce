// controllers/checkCartAvailability.js
import { supabase } from "../config/supabaseClient.js";

export const checkCartAvailability = async (req, res) => {
  try {
    const { items, latitude, longitude } = req.body;

    if (!items || !Array.isArray(items) || !latitude || !longitude) {
      return res.status(400).json({ success: false, error: "Items, latitude, and longitude are required." });
    }
    
    // If the cart is empty, there's nothing to check.
    if (items.length === 0) {
        return res.status(200).json({
            success: true,
            deliverableProductIds: [],
            undeliverableProductIds: [],
        });
    }

    // Temporarily allow all items to be deliverable (bypass location check)
    const deliverableProductIds = items.map((item) => item.product_id);
    const undeliverableProductIds = [];

    // ✅ CHANGED: Update the response to send back the two distinct lists
    return res.status(200).json({
      success: true,
      deliverableProductIds,   // List of items that CAN be delivered
      undeliverableProductIds, // List of items that CANNOT be delivered
    });

  } catch (err) {
    console.error("Delivery check failed:", err.message);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};