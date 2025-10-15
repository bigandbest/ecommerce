import { supabase } from "../config/supabaseClient.js";

// Get wallet details for a user
export const getWalletDetails = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "User ID is required" });
    }

    const { data: wallet, error } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // If wallet doesn't exist, create one
      if (error.code === "PGRST116") {
        const { data: newWallet, error: createError } = await supabase
          .from("user_wallets")
          .insert({ user_id: userId, balance: 0.0 })
          .select()
          .single();

        if (createError) {
          return res
            .status(500)
            .json({ success: false, error: createError.message });
        }

        return res.json({ success: true, wallet: newWallet });
      }
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, wallet });
  } catch (error) {
    console.error("Get wallet details error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get wallet transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;
    const { page = 1, limit = 20, type, status } = req.query;

    console.log("Fetching transaction history for user:", userId);
    console.log("Query params:", { page, limit, type, status });

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "User ID is required" });
    }

    // First, get the total count for pagination
    let countQuery = supabase
      .from("wallet_transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (status && status !== "") {
      countQuery = countQuery.eq("status", status);
    }

    console.log("Executing count query...");
    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error("Count query error:", countError);
      return res
        .status(500)
        .json({ success: false, error: countError.message });
    }

    console.log("Total count:", totalCount);

    // If there are no transactions, return empty array immediately
    if (totalCount === 0) {
      console.log("No transactions found for user");
      return res.json({
        success: true,
        transactions: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          totalPages: 0,
        },
      });
    }

    // Build the main query WITHOUT join to avoid hanging
    let query = supabase
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (status && status !== "") {
      query = query.eq("status", status);
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    console.log("Executing main query...");
    const { data: transactions, error } = await query;

    if (error) {
      console.error("Transaction query error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log("Transactions fetched:", transactions?.length || 0);

    // If we have transactions, enrich them with transaction type details
    let enrichedTransactions = transactions;
    if (transactions && transactions.length > 0) {
      const typeIds = [
        ...new Set(
          transactions
            .map((t) => t.transaction_type_id)
            .filter((id) => id != null)
        ),
      ];

      if (typeIds.length > 0) {
        console.log("Fetching transaction types for IDs:", typeIds);
        const { data: types, error: typesError } = await supabase
          .from("transaction_types")
          .select("*")
          .in("id", typeIds);

        if (!typesError && types) {
          console.log("Transaction types fetched:", types.length);
          const typesMap = types.reduce((acc, type) => {
            acc[type.id] = type;
            return acc;
          }, {});

          enrichedTransactions = transactions.map((transaction) => ({
            ...transaction,
            transaction_type: typesMap[transaction.transaction_type_id] || null,
          }));
        } else {
          console.warn("Failed to fetch transaction types:", typesError);
        }
      }
    }

    res.json({
      success: true,
      transactions: enrichedTransactions || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Create wallet recharge request
export const createRechargeRequest = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "User authentication required" });
    }

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Valid amount is required" });
    }

    // Get wallet settings
    const { data: minSetting } = await supabase
      .from("wallet_settings")
      .select("setting_value")
      .eq("setting_key", "min_recharge_amount")
      .single();

    const { data: maxSetting } = await supabase
      .from("wallet_settings")
      .select("setting_value")
      .eq("setting_key", "max_recharge_amount")
      .single();

    const minAmount = parseFloat(minSetting?.setting_value || 10);
    const maxAmount = parseFloat(maxSetting?.setting_value || 50000);

    if (amount < minAmount || amount > maxAmount) {
      return res.status(400).json({
        success: false,
        error: `Amount must be between ₹${minAmount} and ₹${maxAmount}`,
      });
    }

    // Get user wallet
    const { data: wallet, error: walletError } = await supabase
      .from("user_wallets")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (walletError) {
      return res
        .status(500)
        .json({ success: false, error: "Wallet not found" });
    }

    // Create recharge request
    const { data: rechargeRequest, error } = await supabase
      .from("wallet_recharge_requests")
      .insert({
        user_id: userId,
        wallet_id: wallet.id,
        amount: amount,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, rechargeRequest });
  } catch (error) {
    console.error("Create recharge request error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Process wallet payment for order
export const processWalletPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId, amount } = req.body;

    if (!userId || !orderId || !amount) {
      return res.status(400).json({
        success: false,
        error: "User ID, order ID, and amount are required",
      });
    }

    // Get user wallet with lock
    const { data: wallet, error: walletError } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return res
        .status(404)
        .json({ success: false, error: "Wallet not found" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        error: "Insufficient wallet balance",
        currentBalance: wallet.balance,
        requiredAmount: amount,
      });
    }

    // Use the stored procedure to update balance and create transaction
    const { data: result, error: updateError } = await supabase.rpc(
      "update_wallet_balance",
      {
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_is_credit: false,
        p_transaction_type_id: 2, // ORDER_PAYMENT
        p_reference_id: orderId,
        p_reference_type: "order",
        p_description: `Payment for order #${orderId}`,
        p_created_by: userId,
      }
    );

    if (updateError || !result.success) {
      return res.status(500).json({
        success: false,
        error:
          result?.error || updateError?.message || "Payment processing failed",
      });
    }

    res.json({
      success: true,
      message: "Payment processed successfully",
      transactionId: result.transaction_id,
      newBalance: result.new_balance,
    });
  } catch (error) {
    console.error("Process wallet payment error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

import {
  createRefundNotification,
  createAdminRefundNotification,
} from "./NotificationHelpers.js";

// Process wallet refund
export const processWalletRefund = async (req, res) => {
  try {
    const { userId, orderId, amount, reason } = req.body;
    const adminId = req.user?.id;

    if (!userId || !amount || !reason) {
      return res.status(400).json({
        success: false,
        error: "User ID, amount, and reason are required",
      });
    }

    // Get user wallet
    const { data: wallet, error: walletError } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return res
        .status(404)
        .json({ success: false, error: "Wallet not found" });
    }

    // Use the stored procedure to update balance and create transaction
    const { data: result, error: updateError } = await supabase.rpc(
      "update_wallet_balance",
      {
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_is_credit: true,
        p_transaction_type_id: 3, // REFUND
        p_reference_id: orderId,
        p_reference_type: "order",
        p_description: `Refund for order #${orderId}: ${reason}`,
        p_created_by: adminId,
      }
    );

    if (updateError || !result.success) {
      return res.status(500).json({
        success: false,
        error:
          result?.error || updateError?.message || "Refund processing failed",
      });
    }

    // Get user details for notifications
    const { data: userData } = await supabase
      .from("users")
      .select("name")
      .eq("id", userId)
      .single();

    // Create notifications
    await createRefundNotification(userId, orderId, "completed", amount);

    res.json({
      success: true,
      message: "Refund processed successfully",
      transactionId: result.transaction_id,
      newBalance: result.new_balance,
    });
  } catch (error) {
    console.error("Process wallet refund error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Add money to wallet (admin function)
export const addMoneyToWallet = async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;
    const adminId = req.user?.id;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: "User ID and valid amount are required",
      });
    }

    // Get user wallet
    const { data: wallet, error: walletError } = await supabase
      .from("user_wallets")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (walletError || !wallet) {
      return res
        .status(404)
        .json({ success: false, error: "Wallet not found" });
    }

    // Use the stored procedure to update balance and create transaction
    const { data: result, error: updateError } = await supabase.rpc(
      "update_wallet_balance",
      {
        p_wallet_id: wallet.id,
        p_amount: amount,
        p_is_credit: true,
        p_transaction_type_id: 5, // ADMIN_CREDIT
        p_reference_id: null,
        p_reference_type: "admin",
        p_description: reason || `Admin credit of ₹${amount}`,
        p_created_by: adminId,
      }
    );

    if (updateError || !result.success) {
      return res.status(500).json({
        success: false,
        error:
          result?.error || updateError?.message || "Credit processing failed",
      });
    }

    res.json({
      success: true,
      message: "Money added successfully",
      transactionId: result.transaction_id,
      newBalance: result.new_balance,
    });
  } catch (error) {
    console.error("Add money to wallet error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get wallet statistics (admin function)
export const getWalletStatistics = async (req, res) => {
  try {
    // Get total wallets count
    const { count: totalWallets } = await supabase
      .from("user_wallets")
      .select("*", { count: "exact", head: true });

    // Get total balance across all wallets
    const { data: balanceData } = await supabase
      .from("user_wallets")
      .select("balance");

    const totalBalance =
      balanceData?.reduce(
        (sum, wallet) => sum + parseFloat(wallet.balance),
        0
      ) || 0;

    // Get total transactions count
    const { count: totalTransactions } = await supabase
      .from("wallet_transactions")
      .select("*", { count: "exact", head: true });

    // Get recent transactions
    const { data: recentTransactions } = await supabase
      .from("wallet_transactions")
      .select(
        `
                *,
                transaction_type:transaction_types(type_code, type_name, is_credit),
                user:users(email, full_name)
            `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    res.json({
      success: true,
      statistics: {
        totalWallets,
        totalBalance,
        totalTransactions,
        recentTransactions,
      },
    });
  } catch (error) {
    console.error("Get wallet statistics error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get all wallet recharge requests (admin function)
export const getRechargeRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let query = supabase
      .from("wallet_recharge_requests")
      .select(
        `
                *,
                user:users(email, full_name, phone),
                wallet:user_wallets(balance)
            `
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: requests, error, count } = await query;

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      requests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get recharge requests error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get users with their wallet information for admin
export const getUsersWithWallets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("users")
      .select(
        `
                id,
                name,
                email,
                phone,
                created_at,
                user_wallets (
                    balance,
                    created_at,
                    updated_at
                )
            `
      )
      .range(offset, offset + parseInt(limit) - 1)
      .order("created_at", { ascending: false });

    // Add search filter
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data: users, error, count } = await query;

    if (error) throw error;

    // Format the response
    const formattedUsers = users.map((user) => ({
      ...user,
      wallet_balance: user.user_wallets?.[0]?.balance || 0,
      wallet_created_at: user.user_wallets?.[0]?.created_at,
      wallet_updated_at: user.user_wallets?.[0]?.updated_at,
    }));

    res.json({
      success: true,
      users: formattedUsers,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching users with wallets:", error);
    res.status(500).json({
      error: "Failed to fetch users with wallets",
      details: error.message,
    });
  }
};
