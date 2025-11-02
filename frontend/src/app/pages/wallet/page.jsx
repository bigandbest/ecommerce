"use client";
import { useState, useEffect } from "react";
import { FaWallet, FaPlus, FaSpinner, FaLock, FaUnlock } from "@/utils/icons";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getWalletDetails } from "@/api/walletApi";
import { toast } from "react-toastify";
import WalletRechargeModal from "@/components/wallet/WalletRechargeModal";
import TransactionHistory from "@/components/wallet/TransactionHistory";

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const fetchWalletDetails = async () => {
    setLoading(true);
    try {
      const response = await getWalletDetails();
      if (response.success) {
        setWallet(response.wallet);
      } else {
        toast.error("Failed to fetch wallet details");
      }
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      toast.error("Failed to fetch wallet details");
    } finally {
      setLoading(false);
    }
  };

  const handleRechargeSuccess = () => {
    fetchWalletDetails();
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading wallet details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wallet</h1>
            <p className="text-gray-600">
              Manage your wallet balance and view transaction history
            </p>
          </div>

          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <FaWallet className="text-xl" />
                </div>
                <span className="text-lg font-medium">Wallet Balance</span>
              </div>
              {wallet?.is_frozen && (
                <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-lg">
                  <FaLock className="text-sm" />
                  <span className="text-sm font-medium">Frozen</span>
                </div>
              )}
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">
                ₹{wallet?.balance?.toFixed(2) || "0.00"}
              </div>
              {wallet?.is_frozen && (
                <p className="text-red-200 text-sm">
                  Wallet is frozen: {wallet.frozen_reason}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowRechargeModal(true)}
              disabled={wallet?.is_frozen}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus className="text-sm" />
              Add Money
            </button>
          </div>

          {/* Wallet Stats */}
          {wallet && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FaWallet className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Recharged</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{wallet.total_recharged?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <FaWallet className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-lg font-bold text-gray-800">
                      ₹{wallet.total_spent?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      wallet.is_frozen ? "bg-red-100" : "bg-green-100"
                    }`}
                  >
                    {wallet.is_frozen ? (
                      <FaLock className="text-red-600" />
                    ) : (
                      <FaUnlock className="text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p
                      className={`text-lg font-bold ${
                        wallet.is_frozen ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {wallet.is_frozen ? "Frozen" : "Active"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <TransactionHistory walletId={wallet?.id} />

          {/* Recharge Modal */}
          <WalletRechargeModal
            isOpen={showRechargeModal}
            onClose={() => setShowRechargeModal(false)}
            onRechargeSuccess={handleRechargeSuccess}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default WalletPage;
