import { useState, useEffect, useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://big-best-backend.vercel.app/api";

export const useOrderTracking = (orderId, initialStatus) => {
  const [orderStatus, setOrderStatus] = useState(initialStatus);
  const [isConnected, setIsConnected] = useState(false);

  const checkOrderStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/order/status/${orderId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return; // Order not found, stop polling
        }
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.status !== orderStatus) {
        setOrderStatus(data.status);
      }
    } catch (error) {
      if (error.name !== "SyntaxError") {
        console.error("Error checking order status:", error);
      }
    }
  }, [orderId, orderStatus]);

  useEffect(() => {
    if (!orderId) return;

    // Poll every 30 seconds for status updates
    const interval = setInterval(checkOrderStatus, 30000);
    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [orderId, checkOrderStatus]);

  return { orderStatus, isConnected, refreshStatus: checkOrderStatus };
};
