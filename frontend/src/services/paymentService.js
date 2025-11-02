"use client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://big-best-backend.vercel.app/api";
export const createRazorpayOrder = async (amount, orderDetails = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        ...orderDetails,
      }),
    });

    // Check if response is HTML (server error)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Backend server not available. Please try again later.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create order");
    }

    return data;
  } catch (error) {
    console.error("Create order error:", error);

    // Handle network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Backend server not available. Please try again later.");
    }

    throw error;
  }
};

export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    // Check if response is HTML (server error)
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Backend server not available. Please try again later.");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Payment verification failed");
    }

    return data;
  } catch (error) {
    console.error("Payment verification error:", error);

    // Handle network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Backend server not available. Please try again later.");
    }

    throw error;
  }
};
