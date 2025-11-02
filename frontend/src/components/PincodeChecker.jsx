'use client';
import { useState } from 'react';
import { MapPin, Truck, Clock } from 'lucide-react';

const PincodeChecker = ({ onPincodeChange }) => {
  const [pincode, setPincode] = useState('');
  const [pincodeData, setPincodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/location/pincode/${pincode}`);
      const data = await response.json();

      if (data.success) {
        setPincodeData(data.data);
        onPincodeChange?.(data.data);
      } else {
        setError(data.message);
        setPincodeData(null);
      }
    } catch (err) {
      setError('Failed to check pincode');
      setPincodeData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-800">Check Delivery</h3>
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
          onClick={checkPincode}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm mb-2">{error}</div>
      )}

      {pincodeData && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{pincodeData.city}, {pincodeData.state}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Truck className="w-4 h-4" />
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
    </div>
  );
};

export default PincodeChecker;