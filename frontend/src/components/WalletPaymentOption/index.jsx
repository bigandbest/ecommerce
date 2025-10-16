import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useWallet } from "../../contexts/WalletContext";
import { FaWallet, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import "./WalletPaymentOption.css";

const WalletPaymentOption = ({
  orderAmount,
  onPaymentSuccess,
  onPaymentError,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const { wallet, checkWalletBalance, processWalletPayment, loading } =
    useWallet();
  const [hasBalance, setHasBalance] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if wallet is frozen
  const isFrozen = wallet?.is_frozen;

  useEffect(() => {
    const checkBalance = async () => {
      if (orderAmount && wallet && !isFrozen) {
        const hasEnoughBalance = await checkWalletBalance(orderAmount);
        setHasBalance(hasEnoughBalance);
      }
    };
    checkBalance();
  }, [orderAmount, wallet, checkWalletBalance, isFrozen]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleWalletPayment = async (orderId) => {
    if (isFrozen) {
      toast.error("Your wallet is frozen. Payment cannot be processed.");
      return;
    }

    if (!hasBalance) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await processWalletPayment(orderId, orderAmount);

      if (result.success) {
        toast.success("Payment successful!");
        if (onPaymentSuccess) {
          onPaymentSuccess({
            paymentMethod: "wallet",
            transactionId: result.transactionId,
            amount: orderAmount,
            newBalance: result.newBalance,
          });
        }
      }
    } catch (error) {
      console.error("Wallet payment failed:", error);
      toast.error(error.message || "Payment failed");
      if (onPaymentError) {
        onPaymentError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const shortfall = wallet?.balance
    ? Math.max(0, orderAmount - wallet.balance)
    : orderAmount;

  return (
    <div
      className={`wallet-payment-option ${isSelected ? "selected" : ""} ${
        disabled || isFrozen ? "disabled" : ""
      }`}
    >
      <div
        className="payment-option-header"
        onClick={!isFrozen ? onSelect : undefined}
      >
        <div className="option-radio">
          <input
            type="radio"
            name="paymentMethod"
            value="wallet"
            checked={isSelected}
            onChange={onSelect}
            disabled={disabled || isFrozen}
          />
          <span className="radio-checkmark"></span>
        </div>

        <div className="option-icon">
          <FaWallet className={`wallet-icon ${isFrozen ? "frozen" : ""}`} />
        </div>

        <div className="option-details">
          <h3>
            Pay with Wallet
            {isFrozen && (
              <span className="frozen-badge">
                <FaExclamationTriangle style={{ marginRight: "4px" }} />
                Frozen
              </span>
            )}
          </h3>
          <p>
            {isFrozen
              ? "Wallet is currently frozen"
              : "Use your wallet balance to pay instantly"}
          </p>
        </div>

        <div className="wallet-balance-info">
          <span className="balance-label">Available:</span>
          <span
            className={`balance-amount ${
              isFrozen ? "frozen" : hasBalance ? "sufficient" : "insufficient"
            }`}
          >
            {formatCurrency(wallet?.balance || 0)}
          </span>
        </div>
      </div>

      {isSelected && isFrozen && (
        <div className="payment-option-details">
          <div className="frozen-wallet-warning">
            <FaExclamationTriangle className="warning-icon large" />
            <div className="warning-content">
              <h4>Wallet Frozen</h4>
              <p>Your wallet has been frozen by the administrator.</p>
              {wallet?.frozen_reason && (
                <p className="frozen-reason">
                  <strong>Reason:</strong> {wallet.frozen_reason}
                </p>
              )}
              <p className="frozen-info">
                You cannot make payments using your wallet until it is unfrozen.
                Please contact support for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSelected && !isFrozen && (
        <div className="payment-option-details">
          <div className="payment-breakdown">
            <div className="breakdown-row">
              <span>Order Amount:</span>
              <span>{formatCurrency(orderAmount)}</span>
            </div>
            <div className="breakdown-row">
              <span>Wallet Balance:</span>
              <span className={hasBalance ? "text-success" : "text-error"}>
                {formatCurrency(wallet?.balance || 0)}
              </span>
            </div>
            {!hasBalance && shortfall > 0 && (
              <div className="breakdown-row shortfall">
                <span>Shortfall:</span>
                <span className="text-error">{formatCurrency(shortfall)}</span>
              </div>
            )}
          </div>

          {!hasBalance ? (
            <div className="insufficient-balance-warning">
              <FaExclamationTriangle className="warning-icon" />
              <div className="warning-content">
                <p>Insufficient wallet balance</p>
                <span>
                  Please add {formatCurrency(shortfall)} to complete this
                  payment
                </span>
              </div>
            </div>
          ) : (
            <div className="sufficient-balance-info">
              <div className="success-content">
                <p>✓ You have sufficient balance to complete this payment</p>
                <span>
                  Remaining balance after payment:{" "}
                  {formatCurrency(wallet.balance - orderAmount)}
                </span>
              </div>
            </div>
          )}

          {/* This method would be called by the parent component with the orderId */}
          <div className="payment-action" style={{ display: "none" }}>
            <button
              onClick={() => handleWalletPayment("ORDER_ID_FROM_PARENT")}
              disabled={!hasBalance || isProcessing || loading || isFrozen}
              className="wallet-pay-button"
            >
              {isProcessing || loading ? (
                <>
                  <FaSpinner className="spinner" />
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(orderAmount)}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

WalletPaymentOption.propTypes = {
  orderAmount: PropTypes.number.isRequired,
  onPaymentSuccess: PropTypes.func,
  onPaymentError: PropTypes.func,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default WalletPaymentOption;
