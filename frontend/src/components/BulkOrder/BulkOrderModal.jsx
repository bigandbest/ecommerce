'use client';
import { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import { CartContext } from '@/Context/CartContext';

const BulkOrderModal = ({ isOpen, onClose, product }) => {
  const { addToCart } = useContext(CartContext);
  const [bulkSettings, setBulkSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(50);

  useEffect(() => {
    if (isOpen && product?.id) {
      fetchBulkSettings();
    }
  }, [isOpen, product]);

  const fetchBulkSettings = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://big-best-backend.vercel.app/api';
      const response = await fetch(`${apiUrl}/bulk-products/product/${product.id}`);
      
      if (!response.ok) {
        console.error('API response not ok:', response.status);
        setBulkSettings(null);
        return;
      }
      
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Response text:', text);
        setBulkSettings(null);
        return;
      }
      
      if (data.success && data.product.bulk_product_settings?.[0]) {
        const settings = data.product.bulk_product_settings[0];
        setBulkSettings(settings);
        setQuantity(settings.min_quantity);
      } else {
        setBulkSettings(null);
      }
    } catch (error) {
      console.error('Error fetching bulk settings:', error);
      setBulkSettings(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!bulkSettings) return 0;
    return quantity * bulkSettings.bulk_price;
  };

  const calculateSavings = () => {
    if (!bulkSettings) return 0;
    const regularTotal = quantity * (product.discounted_single_product_price || product.price);
    const bulkTotal = calculateTotal();
    return regularTotal - bulkTotal;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bulk Order - {product?.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !bulkSettings || !bulkSettings.is_bulk_enabled ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Bulk ordering is not available for this product.</p>
            <p className="text-sm text-gray-500 mb-4">Contact our sales team for bulk pricing inquiries.</p>
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bulk Pricing Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Bulk Pricing Details</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Minimum Quantity:</span> {bulkSettings.min_quantity} units</p>
                <p><span className="font-medium">Bulk Price:</span> ₹{bulkSettings.bulk_price} per unit</p>
                <p><span className="font-medium">Regular Price:</span> ₹{product.discounted_single_product_price || product.price} per unit</p>
                {bulkSettings.discount_percentage > 0 && (
                  <p><span className="font-medium">Discount:</span> {bulkSettings.discount_percentage}% off</p>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity (Min: {bulkSettings.min_quantity})
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(bulkSettings.min_quantity, parseInt(e.target.value) || bulkSettings.min_quantity))}
                min={bulkSettings.min_quantity}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Price Calculation */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bulk Total:</span>
                  <span className="font-semibold">₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>You Save:</span>
                  <span className="font-semibold">₹{calculateSavings().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const bulkItem = {
                    id: product.id,
                    name: product.name,
                    price: bulkSettings.bulk_price,
                    originalPrice: product.discounted_single_product_price || product.price,
                    image: product.image,
                    quantity: quantity,
                    isBulkOrder: true,
                    bulkRange: `${bulkSettings.min_quantity}+ units`,
                    bulkPrice: bulkSettings.bulk_price
                  };
                  addToCart(bulkItem);
                  toast.success(`Added ${quantity} units to cart as bulk order!`);
                  onClose();
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Add to Cart (Bulk)
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              * Our sales team will contact you within 24 hours to finalize pricing and delivery.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkOrderModal;