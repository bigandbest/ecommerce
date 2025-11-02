// Real-time order status update service
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://big-best-backend.vercel.app/api";

export const orderStatusService = {
  // Update order status
  updateOrderStatus: async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/order/status/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      return await response.json();
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // Get current order status
  getOrderStatus: async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/order/status/${orderId}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching order status:", error);
      throw error;
    }
  },
};
