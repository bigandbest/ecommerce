'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaRupeeSign, FaSpinner, FaCreditCard, FaShieldAlt, FaSignInAlt } from 'react-icons/fa';
import { createRazorpayOrder, verifyRazorpayPayment } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

const RazorpayPayment = ({
  totalAmount,
  onPaymentSuccess,
  onPaymentError,
  orderId,
  disabled = false,
  customerDetails = {}
}) => {
  const [loading, setLoading] = useState(false);
  const { currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const handleRazorpayPayment = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue with payment');
      router.push('/pages/login');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    
    try {
      // Simple Razorpay configuration for direct payment
      const options = {
        key: 'rzp_test_1DP5mmOlF5G5ag', // Your test key
        amount: totalAmount * 100, // Amount in paisa
        currency: 'INR',
        name: 'BigBestMart',
        description: `Order Payment - ${orderId}`,
        image: '/logo.png',
        
        // Customer details
        prefill: {
          name: customerDetails.name || currentUser?.user_metadata?.name || 'Customer',
          email: customerDetails.email || currentUser?.email || 'customer@bigbestmart.com',
          contact: customerDetails.phone || currentUser?.user_metadata?.phone || '9999999999'
        },
        
        // Theme
        theme: {
          color: '#FF6B00'
        },
        
        // Success handler
        handler: function (response) {
          console.log('Payment successful:', response);
          toast.success('Payment successful!');
          
          onPaymentSuccess({
            ...response,
            amount: totalAmount,
            orderId: orderId
          });
          
          // Redirect to success page
          router.push(`/pages/payment-success?orderId=${orderId}&paymentId=${response.razorpay_payment_id}&amount=${totalAmount}`);
          setLoading(false);
        },
        
        // Modal settings
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        onPaymentError(response.error);
        setLoading(false);
      });

      rzp.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      onPaymentError(error);
      setLoading(false);
    }
  };

  // Show login required if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gray-300">
              <FaCreditCard className="text-xl text-gray-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Razorpay Gateway</h3>
              <p className="text-sm text-gray-600 mt-1">
                Login required for payment
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
            Please login to proceed with payment
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
          <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
            <FaCreditCard className="text-xl text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Razorpay Gateway</h3>
            <p className="text-sm text-gray-600 mt-1">
              All Payment Methods Available
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-gray-800">₹{totalAmount.toFixed(2)}</div>
          <p className="text-sm text-green-600 font-medium">🔒 100% Secure</p>
        </div>
      </div>

      {/* Payment Methods Icons */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>💳</span>
            <span>Cards</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📱</span>
            <span>UPI</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🏦</span>
            <span>Banking</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👛</span>
            <span>Wallets</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleRazorpayPayment}
        disabled={loading || disabled}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <>
            <FaSpinner className="animate-spin text-xl" />
            Processing Payment...
          </>
        ) : (
          <>
            <FaRupeeSign className="text-xl" />
            Pay ₹{totalAmount.toFixed(2)} Now
          </>
        )}
      </button>
    </div>
  );
};

export default RazorpayPayment;