'use client';
import { useState, useEffect } from 'react';
import { MapPin, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

const PincodeProductChecker = ({ onPincodeChange, showProducts = false }) => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [pincodeData, setPincodeData] = useState(null);
  const [error, setError] = useState('');

  const checkPincodeProducts = async () => {
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First check pincode validity
      const pincodeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/location/pincode/${pincode}`);
      const pincodeResult = await pincodeResponse.json();

      if (!pincodeResult.success) {
        setError(pincodeResult.message);
        setProducts([]);
        setPincodeData(null);
        return;
      }

      setPincodeData(pincodeResult.data);
      onPincodeChange?.(pincodeResult.data);

      // If showProducts is true, fetch available products
      if (showProducts) {
        const productsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory/pincode/${pincode}/products?limit=20`);
        const productsResult = await productsResponse.json();

        if (productsResult.success) {
          setProducts(productsResult.data.products || []);
        } else {
          setProducts([]);
        }
      }

    } catch (err) {
      setError('Failed to check pincode');
      setProducts([]);
      setPincodeData(null);
    } finally {
      setLoading(false);
    }
  };

  const checkSingleProductAvailability = async (productId, variantId = null) => {
    if (!pincode) return null;

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/inventory/pincode/${pincode}/product/${productId}/availability${variantId ? `?variantId=${variantId}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error checking product availability:', error);
      return null;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-800">Check Delivery & Products</h3>
      </div>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Enter pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          maxLength={6}
        />
        <button
          onClick={checkPincodeProducts}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-2 flex items-center gap-1">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {pincodeData && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{pincodeData.city}, {pincodeData.state}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>Delivery Available</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Delivery in {pincodeData.deliveryTime}</span>
          </div>
          {pincodeData.codAvailable && (
            <div className="text-sm text-blue-600">
              💰 Cash on Delivery Available
            </div>
          )}
        </div>
      )}

      {showProducts && products.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-gray-800">Available Products ({products.length})</h4>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {products.slice(0, 10).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <img 
                    src={product.image || '/placeholder-product.png'} 
                    alt={product.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{product.name}</div>
                    {product.variant && (
                      <div className="text-xs text-gray-600">{product.variant.variant_value}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    Stock: {product.total_stock}
                  </div>
                  <div className="text-xs text-gray-500">
                    {product.delivery_time}
                  </div>
                </div>
              </div>
            ))}
            
            {products.length > 10 && (
              <div className="text-center text-sm text-gray-500 py-2">
                +{products.length - 10} more products available
              </div>
            )}
          </div>
        </div>
      )}

      {showProducts && pincodeData && products.length === 0 && !loading && (
        <div className="border-t pt-4 text-center text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No products available in this area</p>
        </div>
      )}
    </div>
  );
};

// Hook for checking individual product availability
export const useProductAvailability = (pincode) => {
  const checkAvailability = async (productId, variantId = null) => {
    if (!pincode) return null;

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/inventory/pincode/${pincode}/product/${productId}/availability${variantId ? `?variantId=${variantId}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error checking product availability:', error);
      return null;
    }
  };

  return { checkAvailability };
};

export default PincodeProductChecker;