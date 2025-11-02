'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const BulkOrderDetection = ({ cartItems, onBulkOrderCreate, totalAmount, selectedAddress }) => {
  const [hasBulkItems, setHasBulkItems] = useState(false);
  const [bulkOrderCount, setBulkOrderCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if cart has bulk items
    const bulkItems = cartItems.filter(item => item.isBulkOrder || item.quantity >= 50);
    setHasBulkItems(bulkItems.length > 0);
    setBulkOrderCount(bulkItems.length);
  }, [cartItems]);

  const handleBulkOrderSubmit = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.isBulkOrder ? item.bulkPrice : item.price,
          is_bulk_order: item.isBulkOrder || item.quantity >= 50,
          bulk_range: item.bulkRange || null,
          original_price: item.originalPrice || item.price
        })),
        total_price: totalAmount,
        email: 'customer@example.com', // Get from user context
        contact: selectedAddress.mobile,
        shipping_address: {
          firstName: selectedAddress.label.split(' ')[0] || 'Customer',
          lastName: selectedAddress.label.split(' ').slice(1).join(' ') || '',
          fullAddress: selectedAddress.address,
          city: 'City', // Extract from address
          country: 'India',
          state: 'State', // Extract from address
          zipCode: '000000' // Extract from address
        }
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bulk-orders/order-with-bulk-support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Bulk order placed successfully!');
        onBulkOrderCreate(data.order);
      } else {
        toast.error(data.error || 'Failed to place bulk order');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasBulkItems) {
    return null;
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 font-bold text-sm">B</span>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-orange-800 mb-2">
            Bulk Order Detected!
          </h4>
          <p className="text-orange-700 text-sm mb-3">
            You have {bulkOrderCount} bulk item(s) in your cart. Bulk orders skip the payment gateway and our team will contact you directly for processing.
          </p>
          <div className="bg-white rounded-md p-3 mb-3">
            <h5 className="font-medium text-gray-800 mb-2">Bulk Items:</h5>
            <ul className="space-y-1">
              {cartItems
                .filter(item => item.isBulkOrder || item.quantity >= 50)
                .map((item, index) => (
                  <li key={index} className="text-sm text-gray-600 flex justify-between">
                    <span>{item.name} (Qty: {item.quantity})</span>
                    <span className="font-medium">₹{(item.isBulkOrder ? item.bulkPrice : item.price) * item.quantity}</span>
                  </li>
                ))}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleBulkOrderSubmit}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <span>Place Bulk Order (No Payment Required)</span>
              )}
            </button>
          </div>
          <p className="text-xs text-orange-600 mt-2">
            * Our sales team will contact you within 24 hours to finalize pricing and payment terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkOrderDetection;