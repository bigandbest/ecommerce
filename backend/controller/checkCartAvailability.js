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

    // Call your Postgres RPC function to get all products available at the location
    const { data: nearbyProducts, error } = await supabase.rpc("get_products_within_15km", {
      user_lat: latitude,
      user_lon: longitude,
    });

    if (error) {
      console.error("Supabase RPC Error:", error.message);
      return res.status(500).json({ success: false, error: "Server error during delivery check." });
    }

    // For faster lookups, create a Set of available product IDs
    const availableProductIds = new Set(nearbyProducts.map((p) => p.product_id));

    // ✅ NEW: Determine which items from the user's cart are deliverable
    const deliverableProductIds = items
      .filter((item) => availableProductIds.has(item.product_id))
      .map((item) => item.product_id);

    // ✅ NEW: Determine which items from the user's cart are NOT deliverable
    const undeliverableProductIds = items
      .filter((item) => !availableProductIds.has(item.product_id))
      .map((item) => item.product_id);

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