import express from "express";
import { supabase } from "../config/supabaseClient.js";
import {
  getAllOrders,
  placeOrder,
  placeOrderWithDetailedAddress,
  getUserOrders,
  updateOrderStatus,
  cancelOrder,
  deleteOrderById,
  getOrderTracking,
} from "../controller/orderController.js";

const router = express.Router();

router.get("/all", getAllOrders);
router.get("/", getAllOrders);
router.post("/place", placeOrder);
router.post("/place-detailed", placeOrderWithDetailedAddress);
router.get("/status/:id", async (req, res) => {
  const { data, error } = await supabase.from("orders").select("status").eq("id", req.params.id).single();
  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.json({ success: true, status: data.status });
});
router.get("/user/:user_id", getUserOrders);
router.put("/status/:id", updateOrderStatus);
router.put("/cancel/:id", cancelOrder);
router.delete("/delete/:id", deleteOrderById);

// Tracking endpoint - returns simple timeline for an order
router.get("/track/:orderId", getOrderTracking);

export default router;
