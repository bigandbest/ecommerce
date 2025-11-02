// src/api/trackingApi.js
// Lightweight tracking API used by the frontend to fetch order tracking timeline
import supabase from "../services/supabase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://big-best-backend.vercel.app/api";

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };
};

export const getOrderTracking = async (orderId) => {
  if (!orderId) throw new Error("orderId required");
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/order/track/${orderId}`, {
      method: "GET",
      headers,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
  } catch (err) {
    console.error("getOrderTracking error:", err);
    throw err;
  }
};
