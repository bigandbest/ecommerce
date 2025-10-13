import { useState } from "react";
import PropTypes from "prop-types";
import { useWallet } from "../../contexts/WalletContext";
import { useAuth } from "../../contexts/AuthContext";
import { FaRupeeSign, FaTimes, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import "./WalletRecharge.css";

const WalletRecharge = ({ isOpen, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const {
    createRechargeRequest,
    createWalletRechargeOrder,
    verifyWalletRechargePayment,
    loading,
  } = useWallet();
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const predefinedAmounts = [100, 200, 500, 1000, 2000, 5000];

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount.toString());
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCustomAmount(value);
      setAmount(value);
    }
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      toast.error("Please enter a valid amount");
      return false;
    }
    if (numAmount < 10) {
      toast.error("Minimum recharge amount is ₹10");
      return false;
    }
    if (numAmount > 50000) {
      toast.error("Maximum recharge amount is ₹50,000");
      return false;
    }
    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRecharge = async () => {
    if (!validateAmount()) return;

    setIsProcessing(true);

    try {
      // Step 1: Create recharge request
      const rechargeRequest = await createRechargeRequest(parseFloat(amount));

      // Step 2: Create Razorpay order
      const orderData = await createWalletRechargeOrder(
        parseFloat(amount),
        rechargeRequest.id
      );

      // Step 3: Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      // Step 4: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BigBestMart",
        description: "Wallet Recharge",
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            // Step 5: Verify payment
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              recharge_request_id: orderData.recharge_request_id,
            };

            const result = await verifyWalletRechargePayment(verificationData);

            toast.success(
              `Wallet recharged successfully! New balance: ₹${result.new_balance}`
            );

            if (onSuccess) {
              onSuccess(result);
            }

            handleClose();
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error(error.message || "Payment verification failed");
            setIsProcessing(false);
          }
        },
        prefill: {
          name:
            currentUser?.name || currentUser?.email?.split("@")[0] || "User",
          email: currentUser?.email || "",
        },
        notes: {
          purpose: "wallet_recharge",
          recharge_request_id: rechargeRequest.id,
          user_id: currentUser?.id,
        },
        theme: {
          color: "#667eea",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Recharge failed:", error);
      toast.error(error.message || "Failed to initiate recharge");
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount("");
      setCustomAmount("");
      setIsProcessing(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="wallet-recharge-overlay">
      <div className="wallet-recharge-modal">
        <div className="recharge-header">
          <h2>Add Money to Wallet</h2>
          <button
            onClick={handleClose}
            className="close-button"
            disabled={isProcessing}
          >
            <FaTimes />
          </button>
        </div>

        <div className="recharge-content">
          <div className="amount-section">
            <h3>Select Amount</h3>
            <div className="predefined-amounts">
              {predefinedAmounts.map((preAmount) => (
                <button
                  key={preAmount}
                  onClick={() => handleAmountSelect(preAmount)}
                  className={`amount-button ${
                    amount === preAmount.toString() ? "selected" : ""
                  }`}
                  disabled={isProcessing}
                >
                  <FaRupeeSign />
                  {preAmount}
                </button>
              ))}
            </div>

            <div className="custom-amount">
              <label htmlFor="customAmount">Or enter custom amount:</label>
              <div className="amount-input-wrapper">
                <FaRupeeSign className="rupee-icon" />
                <input
                  id="customAmount"
                  type="text"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  disabled={isProcessing}
                  className="amount-input"
                />
              </div>
            </div>
          </div>

          <div className="selected-amount">
            <h3>
              Amount to Add:{" "}
              <span className="amount-display">₹{amount || "0"}</span>
            </h3>
          </div>

          <div className="recharge-info">
            <ul>
              <li>Minimum recharge amount: ₹10</li>
              <li>Maximum recharge amount: ₹50,000</li>
              <li>Money will be added instantly after successful payment</li>
              <li>Secure payment powered by Razorpay</li>
            </ul>
          </div>

          <div className="recharge-actions">
            <button
              onClick={handleClose}
              className="cancel-button"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleRecharge}
              className="recharge-submit-button"
              disabled={
                !amount || parseFloat(amount) < 10 || isProcessing || loading
              }
            >
              {isProcessing || loading ? (
                <>
                  <FaSpinner className="spinner" />
                  Processing...
                </>
              ) : (
                `Add ₹${amount || "0"}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

WalletRecharge.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default WalletRecharge;
