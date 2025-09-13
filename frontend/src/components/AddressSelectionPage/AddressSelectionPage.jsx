// src/pages/Checkout/AddressSelectionPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocationContext } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAddresses, placeOrderWithDetailedAddress } from '../../utils/supabaseApi'; // You will need to create addGeoAddress
import axios from 'axios';

const AddressSelectionPage = () => {
  const { currentUser } = useAuth();
  const { selectedAddress, setSelectedAddress, orderAddress, setOrderAddress } = useLocationContext();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // You will move the payment and availability logic here from Cart/index.jsx
  // For simplicity, I'm including the Razorpay logic directly.

  useEffect(() => {
    const fetchAddresses = async () => {
      if (currentUser?.id) {
        const { success, addresses } = await getUserAddresses(currentUser.id);
        if (success) {
          setSavedAddresses(addresses);
        }
      }
      // The GPS-captured address is already in `selectedAddress` from the context
      if (selectedAddress) {
        setOrderAddress(selectedAddress); // Set it as the default for this page
      }
      setLoading(false);
    };
    fetchAddresses();
  }, [currentUser, selectedAddress, setOrderAddress]);

  const handleSelectSavedAddress = (address) => {
    setOrderAddress(address); // Update the final order address
  };

  // 👇 THIS LOGIC IS MOVED FROM YOUR CART COMPONENT
  const handleRazorpayPayment = async () => {
    // 1. Check product availability
    try {
      // You'll need to fetch cartItems here, maybe from context or a quick API call
      // const { success, cartItems } = await getCartItems(currentUser.id);
      // const isAvailable = await checkCartAvailability(cartItems, orderAddress);
      // if (!isAvailable) return;
    } catch (e) {
      alert("Failed to check availability.");
      return;
    }

    // 2. Normalize the selected `orderAddress`
    const detailedAddress = orderAddress.is_geolocation
      ? { /* Normalize GPS address */ }
      : { /* Normalize saved address */
          houseNumber: orderAddress.house_number,
          streetAddress: orderAddress.street_address,
          city: orderAddress.city,
          state: orderAddress.state,
          postalCode: orderAddress.postal_code,
          country: orderAddress.country || 'India',
        };

    // 3. Create Razorpay Order
    try {
      // const grandTotal = ... calculate total ...
      const res = await axios.post("https://ecommerce-8342.onrender.com/api/payment/create-order", { amount: 100 /* Replace with grandTotal */ });
      const { order_id, amount } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        // ... all other razorpay options
        handler: async function (response) {
          // ... verification and placeOrderWithDetailedAddress call
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error", err);
      alert("Something went wrong with Razorpay.");
    }
  };

  if (loading) return <div>Loading addresses...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Confirm Your Address</h1>

      {/* GPS Location Display */}
      {selectedAddress && selectedAddress.is_geolocation && (
        <div className="border p-4 rounded-md mb-6 bg-blue-50">
          <h2 className="font-semibold text-lg mb-2">Your Current Location</h2>
          <p>{selectedAddress.formatted_address}</p>
          <button
            onClick={() => handleSelectSavedAddress(selectedAddress)}
            className={`mt-2 py-1 px-3 rounded text-sm ${orderAddress?.formatted_address === selectedAddress.formatted_address ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          >
            {orderAddress?.formatted_address === selectedAddress.formatted_address ? 'Selected' : 'Use this Address'}
          </button>
        </div>
      )}

      {/* Saved Addresses */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Your Saved Addresses</h2>
        {savedAddresses.length > 0 ? (
          savedAddresses.map(addr => (
            <div key={addr.id} className="border p-3 rounded mb-2">
              <p className="font-bold">{addr.address_name}</p>
              <p>{addr.street_address}, {addr.city}, {addr.state} - {addr.postal_code}</p>
              <button
                onClick={() => handleSelectSavedAddress(addr)}
                className={`mt-2 py-1 px-3 rounded text-sm ${orderAddress?.id === addr.id ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              >
                {orderAddress?.id === addr.id ? 'Selected' : 'Deliver Here'}
              </button>
            </div>
          ))
        ) : (
          <p>You have no saved addresses.</p>
        )}
      </div>

      {/* Add New Address Form (conditionally render) */}
      {/* You can add a button to toggle a form for adding a new address here */}

      {/* Proceed to Payment Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleRazorpayPayment}
          disabled={!orderAddress}
          className="bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400"
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default AddressSelectionPage;