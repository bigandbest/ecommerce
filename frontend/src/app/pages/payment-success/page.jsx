'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaHome, FaShoppingBag } from 'react-icons/fa';

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    // Get payment details from URL params
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    const amount = searchParams.get('amount');
    const productName = searchParams.get('productName');

    if (orderId && paymentId && amount) {
      setPaymentDetails({
        orderId,
        paymentId,
        amount: parseFloat(amount),
        productName: productName ? decodeURIComponent(productName) : null
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            {paymentDetails?.productName ? 
              `Your order for "${paymentDetails.productName}" has been confirmed` : 
              'Your order has been confirmed'
            }
          </p>
        </div>

        {/* Payment Details */}
        {paymentDetails && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{paymentDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-medium">{paymentDetails.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-green-600">₹{paymentDetails.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link 
            href="/pages/orders"
            className="w-full bg-[#FF6B00] hover:bg-[#e65c00] text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaShoppingBag />
            View Orders
          </Link>
          
          <Link 
            href="/"
            className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaHome />
            Continue Shopping
          </Link>
        </div>

        {/* Thank You Message */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Thank you for shopping with <span className="font-semibold text-[#FF6B00]">BigBestMart</span>!
          </p>
        </div>
      </div>
    </div>
  );
};

const PaymentSuccess = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-6"></div>
            <div className="h-32 bg-gray-200 rounded mb-6"></div>
            <div className="h-12 bg-gray-200 rounded mb-3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccess;