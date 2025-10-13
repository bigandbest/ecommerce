import { useState, useEffect } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { useAuth } from "../../contexts/AuthContext";
import WalletBalance from "../../components/WalletBalance";
import WalletRecharge from "../../components/WalletRecharge";
import {
  FaHistory,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaFilter,
} from "react-icons/fa";
import "./WalletDashboard.css";

const WalletDashboard = () => {
  const { currentUser } = useAuth();
  const { transactions, fetchTransactionHistory, loading, error } = useWallet();
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    status: "completed",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      fetchTransactionHistory(1, 20, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, filters.type, filters.status]);

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    await fetchTransactionHistory(nextPage, 20, filters);
    setCurrentPage(nextPage);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTransactionIcon = (isCredit) => {
    return isCredit ? (
      <FaArrowUp className="transaction-icon credit" />
    ) : (
      <FaArrowDown className="transaction-icon debit" />
    );
  };

  const getTransactionColor = (isCredit) => {
    return isCredit ? "credit" : "debit";
  };

  if (!currentUser) {
    return (
      <div className="wallet-dashboard">
        <div className="wallet-container">
          <div className="error-message">Please log in to view your wallet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-dashboard">
      <div className="wallet-container">
        {/* Header */}
        <div className="wallet-header">
          <h1>My Wallet</h1>
          <p>Manage your wallet balance and view transaction history</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="balance-section">
          <WalletBalance
            showRechargeButton={true}
            onRechargeClick={() => setShowRechargeModal(true)}
          />
        </div>

        {/* Transaction History */}
        <div className="transactions-section">
          <div className="transactions-header">
            <div className="header-left">
              <FaHistory className="history-icon" />
              <h2>Transaction History</h2>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="filter-toggle"
            >
              <FaFilter />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Transaction Type:</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="RECHARGE">Recharge</option>
                  <option value="ORDER_PAYMENT">Order Payment</option>
                  <option value="REFUND">Refund</option>
                  <option value="CASHBACK">Cashback</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          )}

          {/* Transactions List */}
          <div className="transactions-list">
            {loading && transactions.length === 0 ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading transactions...</p>
              </div>
            ) : error && transactions.length === 0 ? (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={() => fetchTransactionHistory(1, 20, filters)}>
                  Try Again
                </button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="empty-state">
                <FaHistory className="empty-icon" />
                <h3>No Transactions Found</h3>
                <p>Your transaction history will appear here</p>
                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="add-money-button"
                >
                  Add Money to Wallet
                </button>
              </div>
            ) : (
              <>
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-main">
                      <div className="transaction-icon-wrapper">
                        {getTransactionIcon(
                          transaction.transaction_type?.is_credit
                        )}
                      </div>
                      <div className="transaction-details">
                        <h4 className="transaction-title">
                          {transaction.transaction_type?.type_name ||
                            "Transaction"}
                        </h4>
                        <p className="transaction-description">
                          {transaction.description}
                        </p>
                        <div className="transaction-meta">
                          <span className="transaction-date">
                            <FaCalendarAlt />
                            {formatDate(transaction.created_at)}
                          </span>
                          {transaction.reference_id && (
                            <span className="transaction-ref">
                              Ref: {transaction.reference_id.slice(-8)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="transaction-amount">
                        <span
                          className={`amount ${getTransactionColor(
                            transaction.transaction_type?.is_credit
                          )}`}
                        >
                          {transaction.transaction_type?.is_credit ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <span className="balance-after">
                          Balance: {formatCurrency(transaction.balance_after)}
                        </span>
                      </div>
                    </div>
                    {transaction.status !== "completed" && (
                      <div
                        className={`transaction-status ${transaction.status}`}
                      >
                        {transaction.status.toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}

                {!loading && (
                  <div className="load-more-section">
                    <button
                      onClick={handleLoadMore}
                      className="load-more-button"
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recharge Modal */}
      <WalletRecharge
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        onSuccess={() => {
          // Refresh transactions after successful recharge
          fetchTransactionHistory(1, 20, filters);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default WalletDashboard;
