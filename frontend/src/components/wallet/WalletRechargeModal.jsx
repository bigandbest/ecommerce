'use client';
import { useState } from 'react';
import { FaTimes, FaWallet, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { createWalletRechargeOrder, verifyWalletRechargePayment } from '@/api/walletApi';
import { toast } from 'react-toastify';

const WalletRechargeModal = ({ isOpen, onClose, onRechargeSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(null);

    const predefinedAmounts = [100, 250, 500, 1000, 2000, 5000];

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount);
        setAmount(amount.toString());
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        setAmount(value);
        setSelectedAmount(null);
    };

    const handleRecharge = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            // Create Razorpay order
            const orderResponse = await createWalletRechargeOrder(parseFloat(amount));

            if (!orderResponse.success) {
                throw new Error(orderResponse.error || 'Failed to create order');
            }

            // Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderResponse.order.amount,
                currency: orderResponse.order.currency,
                name: 'BBM Dost',
                description: `Wallet Recharge - ₹${amount}`,
                order_id: orderResponse.order.id,
                handler: async (response) => {
                    try {
                        // Verify payment
                        const verifyResponse = await verifyWalletRechargePayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyResponse.success) {
                            toast.success('Wallet recharged successfully!');
                            onRechargeSuccess();
                            onClose();
                        } else {
                            throw new Error(verifyResponse.error || 'Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: 'User',
                    email: 'user@example.com',
                },
                theme: {
                    color: '#FF6B00',
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Recharge error:', error);
            toast.error(error.message || 'Failed to process recharge');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <FaWallet className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Add Money to Wallet</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FaTimes className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Predefined Amounts */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Select</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {predefinedAmounts.map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => handleAmountSelect(amt)}
                                    className={`p-3 rounded-xl border-2 transition-all ${selectedAmount === amt
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                        }`}
                                >
                                    <div className="font-semibold">₹{amt}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Enter Custom Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                ₹
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="Enter amount"
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="1"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <FaCreditCard className="text-gray-600" />
                            <span className="text-sm font-semibold text-gray-700">Payment Method</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Secure payment powered by Razorpay. Your payment information is encrypted and secure.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRecharge}
                            disabled={loading || !amount || parseFloat(amount) <= 0}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Add ₹${amount || '0'}`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletRechargeModal;
