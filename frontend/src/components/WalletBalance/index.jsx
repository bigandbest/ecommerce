import { useState } from "react";
import PropTypes from "prop-types";
import { useWallet } from "../../contexts/WalletContext";
import { FaWallet, FaSync, FaPlus, FaLock } from "react-icons/fa";
import "./WalletBalance.css";

const WalletBalance = ({ showRechargeButton = true, onRechargeClick }) => {
  const { wallet, loading, error, fetchWalletDetails } = useWallet();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletDetails();
    setTimeout(() => setRefreshing(false), 500); // Small delay for visual feedback
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading && !wallet) {
    return (
      <div className="wallet-balance-container loading">
        <div className="wallet-balance-card">
          <div className="loading-skeleton">
            <div className="skeleton-icon"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-amount"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="wallet-balance-container error">
        <div className="wallet-balance-card">
          <div className="error-content">
            <FaWallet className="wallet-icon error" />
            <p className="error-message">{error}</p>
            <button onClick={handleRefresh} className="retry-button">
              <FaSync className="sync-icon" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-balance-container">
      <div className="wallet-balance-card">
        {/* Frozen Wallet Warning */}
        {wallet?.is_frozen && (
          <div className="wallet-frozen-banner">
            <div className="frozen-icon-wrapper">
              <FaLock className="frozen-icon" />
            </div>
            <div className="frozen-content">
              <h4 className="frozen-title">Wallet Frozen</h4>
              <p className="frozen-message">
                Your wallet has been temporarily frozen by the administrator.
              </p>
              {wallet.frozen_reason && (
                <p className="frozen-reason">
                  <strong>Reason:</strong> {wallet.frozen_reason}
                </p>
              )}
              {wallet.frozen_at && (
                <p className="frozen-date">
                  <strong>Frozen on:</strong>{" "}
                  {new Date(wallet.frozen_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              <p className="frozen-info">
                You cannot make payments or add money until your wallet is
                unfrozen. Please contact support for assistance.
              </p>
            </div>
          </div>
        )}

        <div className="wallet-header">
          <div className="wallet-icon-title">
            <FaWallet
              className={`wallet-icon ${wallet?.is_frozen ? "frozen" : ""}`}
            />
            <span className="wallet-title">Wallet Balance</span>
            {wallet?.is_frozen && (
              <span className="frozen-badge">
                <FaLock /> Frozen
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            className={`refresh-button ${refreshing ? "refreshing" : ""}`}
            disabled={refreshing}
          >
            <FaSync className={`sync-icon ${refreshing ? "spinning" : ""}`} />
          </button>
        </div>

        <div className="balance-amount">{formatCurrency(wallet?.balance)}</div>

        {wallet && (
          <div className="wallet-stats">
            <div className="stat-item">
              <span className="stat-label">Total Recharged</span>
              <span className="stat-value">
                {formatCurrency(wallet.total_recharged)}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">
                {formatCurrency(wallet.total_spent)}
              </span>
            </div>
          </div>
        )}

        {showRechargeButton && (
          <button
            onClick={onRechargeClick}
            className="recharge-button"
            disabled={wallet?.is_frozen}
            title={
              wallet?.is_frozen
                ? "Cannot add money to frozen wallet"
                : "Add Money"
            }
          >
            <FaPlus className="plus-icon" />
            {wallet?.is_frozen ? "Wallet Frozen" : "Add Money"}
          </button>
        )}

        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

WalletBalance.propTypes = {
  showRechargeButton: PropTypes.bool,
  onRechargeClick: PropTypes.func,
};

export default WalletBalance;
