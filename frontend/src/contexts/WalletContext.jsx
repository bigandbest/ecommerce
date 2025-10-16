import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import axios from "axios";
import PropTypes from "prop-types";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL
      ? `${import.meta.env.VITE_API_BASE_URL}/api`
      : null) ||
    (import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api`
      : null) ||
    "http://localhost:8000/api";

  // Get auth headers
  const getAuthHeaders = useCallback(() => {
    console.log(
      "Getting auth headers, currentUser:",
      !!currentUser,
      "access_token:",
      !!currentUser?.access_token
    );

    if (currentUser?.access_token) {
      return {
        Authorization: `Bearer ${currentUser.access_token}`,
        "Content-Type": "application/json",
      };
    }

    // For development, return basic headers if no token
    console.warn(
      "No access token available. Using basic headers for development."
    );
    return {
      "Content-Type": "application/json",
    };
  }, [currentUser]);

  // Fetch wallet details
  const fetchWalletDetails = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.access_token) {
      console.log("Skipping wallet fetch - user not fully loaded:", {
        hasUser: !!currentUser?.id,
        hasToken: !!currentUser?.access_token,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();
      console.log("Wallet API URL:", `${API_BASE_URL}/wallet/details`);
      console.log("Headers:", headers);
      const response = await axios.get(`${API_BASE_URL}/wallet/details`, {
        headers,
        timeout: 15000, // 15 second timeout
      });

      if (response.data.success) {
        setWallet(response.data.wallet);
      } else {
        setError(response.data.error || "Failed to fetch wallet details");
      }
    } catch (error) {
      console.error("Error fetching wallet details:", error);

      // Handle authentication errors specifically
      if (error.message === "Authentication required. Please login again.") {
        setError(error.message);
      } else if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
      } else {
        setError(
          error.response?.data?.error || "Failed to fetch wallet details"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    currentUser?.id,
    currentUser?.access_token,
    API_BASE_URL,
    getAuthHeaders,
  ]);

  // Fetch transaction history
  const fetchTransactionHistory = useCallback(
    async (page = 1, limit = 20, filters = {}) => {
      if (!currentUser?.id || !currentUser?.access_token) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...filters,
        });

        const response = await axios.get(
          `${API_BASE_URL}/wallet/transactions?${params}`,
          {
            headers: getAuthHeaders(),
            timeout: 30000, // 30 second timeout to prevent infinite loading
          }
        );

        if (response.data.success) {
          if (page === 1) {
            setTransactions(response.data.transactions);
          } else {
            setTransactions((prev) => [...prev, ...response.data.transactions]);
          }
          return response.data;
        } else {
          setError(response.data.error || "Failed to fetch transactions");
          return { success: false, error: response.data.error };
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);

        // Handle timeout errors
        if (
          error.code === "ECONNABORTED" ||
          error.message.includes("timeout")
        ) {
          const errorMessage = "Request timeout. Please try again.";
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        const errorMessage =
          error.response?.data?.error || "Failed to fetch transactions";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [currentUser?.id, currentUser?.access_token, API_BASE_URL, getAuthHeaders]
  );

  // Create recharge request
  const createRechargeRequest = async (amount) => {
    if (!currentUser?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/recharge/request`,
        { amount },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        return response.data.rechargeRequest;
      } else {
        throw new Error(
          response.data.error || "Failed to create recharge request"
        );
      }
    } catch (error) {
      console.error("Error creating recharge request:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create recharge request";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Create Razorpay order for wallet recharge
  const createWalletRechargeOrder = async (amount, rechargeRequestId) => {
    if (!currentUser?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Creating Razorpay order:", { amount, rechargeRequestId });

      const response = await axios.post(
        `${API_BASE_URL}/wallet/recharge/create-order`,
        { amount, rechargeRequestId },
        { headers: getAuthHeaders() }
      );

      console.log("Order creation response:", response.data);

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(
          response.data.error || "Failed to create payment order"
        );
      }
    } catch (error) {
      console.error("Error creating payment order:", error);
      console.error("Error response:", error.response?.data);

      // Get detailed error message
      let errorMessage = "Failed to create payment order";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (error.response.data.details) {
          errorMessage += `: ${error.response.data.details}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify wallet recharge payment
  const verifyWalletRechargePayment = async (paymentData) => {
    if (!currentUser?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/recharge/verify-payment`,
        paymentData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Refresh wallet details after successful recharge
        await fetchWalletDetails();
        return response.data;
      } else {
        throw new Error(response.data.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      const errorMessage =
        error.response?.data?.error || "Payment verification failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Process wallet payment for order
  const processWalletPayment = async (orderId, amount) => {
    if (!currentUser?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/wallet/pay`,
        { orderId, amount },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        // Refresh wallet details after successful payment
        await fetchWalletDetails();
        return response.data;
      } else {
        throw new Error(response.data.error || "Payment failed");
      }
    } catch (error) {
      console.error("Error processing wallet payment:", error);
      const errorMessage = error.response?.data?.error || "Payment failed";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check wallet balance
  const checkWalletBalance = async (amount) => {
    if (!currentUser?.id) return false;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/payment/check-wallet-balance`,
        { userId: currentUser.id, amount },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        return response.data.hasBalance;
      }
      return false;
    } catch (error) {
      console.error("Error checking wallet balance:", error);
      return false;
    }
  };

  // Load wallet data when user changes
  useEffect(() => {
    if (currentUser?.id) {
      fetchWalletDetails();
    } else {
      setWallet(null);
      setTransactions([]);
    }
  }, [currentUser?.id, fetchWalletDetails]);

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value = {
    wallet,
    transactions,
    loading,
    error,
    fetchWalletDetails,
    fetchTransactionHistory,
    createRechargeRequest,
    createWalletRechargeOrder,
    verifyWalletRechargePayment,
    processWalletPayment,
    checkWalletBalance,
    clearError: () => setError(null),
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};

WalletProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
