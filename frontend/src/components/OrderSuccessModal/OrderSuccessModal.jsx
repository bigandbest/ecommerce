import React from 'react';
import { useNavigate } from 'react-router-dom';

const OrderSuccessModal = ({ isOpen, onClose, orderDetails }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleViewOrders = () => {
    onClose();
    navigate('/MyOrders');
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-4">
          Your order has been confirmed and will be processed shortly.
        </p>
        
        {orderDetails && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold mb-2">Order Summary</h3>
            <p className="text-sm text-gray-600">Order ID: #{orderDetails.id?.slice(0, 8)}</p>
            <p className="text-sm text-gray-600">Total: ₹{orderDetails.total?.toLocaleString('en-IN')}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleViewOrders}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            View My Orders
          </button>
          <button
            onClick={handleContinueShopping}
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;