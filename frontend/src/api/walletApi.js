// src/api/walletApi.js
// Complete wallet API wrapper for the main frontend app
import supabase from "../services/supabase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://big-best-backend.vercel.app/api";

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };
};

// Get wallet details for current user
export const getWalletDetails = async () => {
  try {
    // Check if user is authenticated first
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return {
        success: false,
        error: "User not authenticated",
        requiresLogin: true,
      };
    }

    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/details`, {
      headers,
    });

    if (res.status === 401) {
      return {
        success: false,
        error: "Authentication required",
        requiresLogin: true,
      };
    }

    if (!res.ok) {
      const errorText = await res.text();
      // Check if response is HTML (server error page)
      if (errorText.includes("<!DOCTYPE") || errorText.includes("<html>")) {
        throw new Error(
          `Server connection failed. Please check if backend is running.`
        );
      }
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("getWalletDetails error:", err.message);

    // Handle network/connection errors
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      return {
        success: false,
        error: "Backend server not available",
        serverDown: true,
      };
    }

    return {
      success: false,
      error: err.message,
      requiresLogin:
        err.message.includes("401") || err.message.includes("Unauthorized"),
      serverDown: err.message.includes("Server connection failed"),
    };
  }
};

// Get wallet details for specific user (admin)
export const getWalletDetailsById = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/details/${userId}`, {
      headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getWalletDetailsById error:", err);
    throw err;
  }
};

// Get transaction history
export const getTransactionHistory = async (page = 1, limit = 20) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_BASE_URL}/wallet/transactions?page=${page}&limit=${limit}`,
      {
        headers,
      }
    );
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("getTransactionHistory error:", err.message);
    return {
      success: false,
      error: err.message,
      transactions: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
};

// Create wallet recharge request
export const createRechargeRequest = async (amount) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/recharge/request`, {
      method: "POST",
      headers,
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
  } catch (err) {
    console.error("createRechargeRequest error:", err);
    throw err;
  }
};

// Create Razorpay order for wallet recharge
export const createWalletRechargeOrder = async (amount) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/recharge/create-order`, {
      method: "POST",
      headers,
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
  } catch (err) {
    console.error("createWalletRechargeOrder error:", err);
    throw err;
  }
};

// Verify wallet recharge payment
export const verifyWalletRechargePayment = async (paymentData) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/recharge/verify-payment`, {
      method: "POST",
      headers,
      body: JSON.stringify(paymentData),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
  } catch (err) {
    console.error("verifyWalletRechargePayment error:", err);
    throw err;
  }
};

// Process wallet payment for order
export const processWalletPayment = async ({ orderId, amount }) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/pay`, {
      method: "POST",
      headers,
      body: JSON.stringify({ orderId, amount }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
  } catch (err) {
    console.error("processWalletPayment error:", err);
    throw err;
  }
};

// Admin functions
export const addMoneyToWallet = async ({ userId, amount, reason }) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/admin/add-money`, {
      method: "POST",
      headers,
      body: JSON.stringify({ userId, amount, reason }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
  } catch (err) {
    console.error("addMoneyToWallet error:", err);
    throw err;
  }
};

export const freezeWallet = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/admin/freeze/${userId}`, {
      method: "POST",
      headers,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
  } catch (err) {
    console.error("freezeWallet error:", err);
    throw err;
  }
};

export const unfreezeWallet = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/admin/unfreeze/${userId}`, {
      method: "POST",
      headers,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return await res.json();
  } catch (err) {
    console.error("unfreezeWallet error:", err);
    throw err;
  }
};

export const getWalletStatistics = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/wallet/admin/statistics`, {
      headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getWalletStatistics error:", err);
    throw err;
  }
};

export const getUsersWithWallets = async (page = 1, limit = 20) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      `${API_BASE_URL}/wallet/admin/users-with-wallets?page=${page}&limit=${limit}`,
      {
        headers,
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("getUsersWithWallets error:", err);
    throw err;
  }
};
