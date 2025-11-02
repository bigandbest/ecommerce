'use client';
import { useState, useEffect } from 'react';
import { FaWallet, FaLock, FaCheck, FaSpinner, FaSignInAlt } from 'react-icons/fa';
import { getWalletDetails, processWalletPayment } from '@/api/walletApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const WalletPaymentOption = ({
    totalAmount,
    onPaymentSuccess,
    onPaymentError,
    orderId,
    disabled = false
}) => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);
    const [walletLoading, setWalletLoading] = useState(true);
    const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && currentUser) {
            fetchWalletDetails();
        } else if (!authLoading) {
            setWalletLoading(false);
        }
    }, [isAuthenticated, currentUser, authLoading]);

    const fetchWalletDetails = async () => {
        if (!isAuthenticated) {
            setWalletLoading(false);
            return;
        }
        
        setWalletLoading(true);
        try {
            const response = await getWalletDetails();
            if (response.success) {
                setWallet(response.wallet);
            } else {
                console.error('Wallet API error:', response.error);
                // Handle server connection issues
                if (response.serverDown) {
                    setWallet({ serverDown: true });
                }
            }
        } catch (error) {
            console.error('Error fetching wallet details:', error);
            setWallet({ serverDown: true });
        } finally {
            setWalletLoading(false);
        }
    };

    const handleWalletPayment = async () => {
        if (!wallet || wallet.is_frozen) {
            toast.error('Wallet is not available for payment');
            return;
        }

        if (wallet.balance < totalAmount) {
            toast.error('Insufficient wallet balance');
            return;
        }

        setLoading(true);
        try {
            const response = await processWalletPayment({
                orderId,
                amount: totalAmount
            });

            if (response.success) {
                toast.success('Payment successful!');
                onPaymentSuccess(response);
            } else {
                throw new Error(response.error || 'Payment failed');
            }
        } catch (error) {
            console.error('Wallet payment error:', error);
            toast.error(error.message || 'Payment failed');
            onPaymentError(error);
        } finally {
            setLoading(false);
        }
    };

    const isWalletAvailable = wallet && !wallet.is_frozen && !wallet.serverDown;
    const hasSufficientBalance = wallet && wallet.balance >= totalAmount;
    const canPayWithWallet = isAuthenticated && isWalletAvailable && hasSufficientBalance && !disabled;
    const isServerDown = wallet?.serverDown;

    if (authLoading || walletLoading) {
        return (
            <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                    <FaSpinner className="animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading wallet details...</span>
                </div>
            </div>
        );
    }

    // Show login required if user is not authenticated
    if (!isAuthenticated) {
        return (
            <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gray-300">
                            <FaWallet className="text-xl text-gray-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">BigBest Wallet</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Login required to use wallet
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">₹{totalAmount.toFixed(2)}</div>
                    </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-blue-800">
                        <FaSignInAlt className="text-sm" />
                        <span className="text-sm font-medium">Login Required</span>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">
                        Please login to use your wallet for payment
                    </p>
                </div>

                <button
                    onClick={() => router.push('/pages/login')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
                >
                    <FaSignInAlt className="text-xl" />
                    Login to Continue
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isWalletAvailable ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-300'}`}>
                        <FaWallet className={`text-xl ${isWalletAvailable ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">BigBest Wallet</h3>
                        {wallet && (
                            <p className="text-sm text-gray-600 mt-1">
                                Balance: ₹{wallet.balance?.toFixed(2) || '0.00'}
                                {wallet.is_frozen && (
                                    <span className="text-red-600 ml-2 font-medium">(Frozen)</span>
                                )}
                            </p>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">₹{totalAmount.toFixed(2)}</div>
                    {!hasSufficientBalance && wallet && (
                        <p className="text-sm text-red-600 font-medium">
                            Need ₹{(totalAmount - wallet.balance).toFixed(2)} more
                        </p>
                    )}
                </div>
            </div>

            {isServerDown && (
                <div className="bg-red-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-red-800">
                        <FaLock className="text-sm" />
                        <span className="text-sm font-medium">Server Connection Error</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                        Backend server is not available. Please try again later.
                    </p>
                </div>
            )}

            {!isWalletAvailable && !isServerDown && wallet && (
                <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-yellow-800">
                        <FaLock className="text-sm" />
                        <span className="text-sm font-medium">Wallet not available</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                        {wallet?.is_frozen ? 'Your wallet is frozen' : 'Wallet not found'}
                    </p>
                </div>
            )}

            {isWalletAvailable && !hasSufficientBalance && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                        <span className="text-sm font-medium">Insufficient balance</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                        Add money to your wallet to continue
                    </p>
                </div>
            )}

            {canPayWithWallet && (
                <button
                    onClick={handleWalletPayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
                >
                    {loading ? (
                        <>
                            <FaSpinner className="animate-spin text-xl" />
                            Processing Payment...
                        </>
                    ) : (
                        <>
                            <FaCheck className="text-xl" />
                            Pay ₹{totalAmount.toFixed(2)} from Wallet
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default WalletPaymentOption;
