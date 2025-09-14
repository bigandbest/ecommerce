// src/pages/Checkout/AddressSelectionPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocationContext } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { placeOrderWithDetailedAddress, getCartItems } from '../../utils/supabaseApi';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const AddressSelectionPage = () => {
  const { currentUser } = useAuth();
  const { mapSelection, orderAddress, setOrderAddress, addresses } = useLocationContext();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch cart items and set initial address
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      // Fetch cart items
      const cartRes = await getCartItems(currentUser.id);
      if (cartRes.success) {
        setCartItems(cartRes.cartItems);
      }
      
      // LOGIC CHANGE: Set the default order address ONLY from saved addresses.
      // Do NOT use mapSelection as a selectable address.
      if (addresses && addresses.length > 0) {
        const defaultAddress = addresses.find(a => a.is_default) || addresses[0];
        setOrderAddress(defaultAddress);
      } else {
        setOrderAddress(null); // Ensure no address is selected if none are saved
      }

      setLoading(false);
    };
    fetchData();
  }, [currentUser, addresses, setOrderAddress]);

  // 2. Calculate order totals
  const subtotal = cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
  const shippingCost = subtotal > 1000 ? 0 : 50;
  const grandTotal = subtotal + shippingCost;

  // 3. Handle selecting a saved address
  const handleSelectAddress = (address) => {
    setOrderAddress(address);
  };

  // 4. Razorpay payment and order placement logic
  const handleRazorpayPayment = async () => {
    // This check is now even more important. It ensures a manual address was selected.
    if (!orderAddress || orderAddress.is_geolocation) {
      alert("Please select a valid, saved delivery address to proceed.");
      return;
    }
    
    // Normalize the final selected *manual* address for the order payload
    const detailedAddress = {
      houseNumber: orderAddress.house_number || "",
      streetAddress: orderAddress.street_address || "",
      city: orderAddress.city || "",
      state: orderAddress.state || "",
      postalCode: orderAddress.postal_code || "",
      country: orderAddress.country || "India",
      landmark: orderAddress.landmark || "",
    };

    try {
      // Create Razorpay order
      const res = await axios.post("https://ecommerce-8342.onrender.com/api/payment/create-order", {
        amount: grandTotal
      });
      const { order_id, amount } = res.data;

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "Big and Best Mart",
        description: "Order Payment",
        order_id,
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

          const verification = await axios.post("https://ecommerce-8342.onrender.com/api/payment/verify-payment", {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
          });

          if (!verification.data.success) {
            alert("Payment verification failed. Please contact support.");
            return;
          }

          // Place order, sending BOTH the manual address and the GPS data
          const orderResponse = await placeOrderWithDetailedAddress(
            currentUser.id, cartItems, subtotal, shippingCost, grandTotal,
            detailedAddress,    // The final confirmed manual address
            "razorpay", razorpay_order_id, razorpay_payment_id, razorpay_signature,
            mapSelection        // The informational GPS data from the map
          );

          if (orderResponse.success) {
            alert("Order placed successfully!");
            navigate('/MyOrders');
          } else {
            alert("Failed to place order: " + (orderResponse.error || "Unknown error"));
          }
        },
        prefill: {
          name: currentUser.user_metadata?.name || currentUser.email,
          email: currentUser.email,
          contact: currentUser.user_metadata?.phone,
        },
        theme: { color: "#3f51b5" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay error", err);
      alert("An error occurred with the payment gateway. Please try again.");
    }
  };

  if (loading) return <div className="text-center p-10">Loading Your Details...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Confirm Your Address & Pay</h1>

      {/* GPS Location Display (Informational Only) */}
      {mapSelection && (
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">GPS Location Reference</h2>
          <div className="border p-4 rounded-md bg-gray-100 text-gray-700">
            <p>📍 {mapSelection.formatted_address}</p>
          </div>
        </div>
      )}

      {/* Saved Addresses (Selection Required) */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Select a Delivery Address</h2>
        {addresses.length > 0 ? (
          addresses.map(addr => (
            <div key={addr.id} className="border p-4 rounded-md mb-2 cursor-pointer hover:border-blue-500" onClick={() => handleSelectAddress(addr)}>
              <div className="flex items-center">
                <input
                  type="radio"
                  id={`addr-${addr.id}`}
                  name="deliveryAddress"
                  checked={orderAddress?.id === addr.id}
                  readOnly
                  className="mr-3 h-4 w-4"
                />
                <label htmlFor={`addr-${addr.id}`} className="w-full">
                  <p className="font-bold">{addr.address_name}</p>
                  <p>{addr.street_address}, {addr.city}, {addr.state} - {addr.postal_code}</p>
                </label>
              </div>
            </div>
          ))
        ) : (
          // NEW: Prompt to add an address if none are saved
          <div className="text-center border-2 border-dashed p-8 rounded-md">
            <p className="text-gray-600 mb-4">You have no saved addresses. Please add an address to continue.</p>
            <Link to="/profile/addresses" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Add a New Address
            </Link>
          </div>
        )}
      </div>

      {/* Order Summary & Payment Button */}
      <div className="border-t pt-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between"><span>Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping:</span> <span>₹{shippingCost.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-lg"><span>Total:</span> <span>₹{grandTotal.toFixed(2)}</span></div>
        </div>
        <button
          onClick={handleRazorpayPayment}
          disabled={!orderAddress || cartItems.length === 0}
          className="w-full bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {!orderAddress ? 'Please Select a Saved Address' : (cartItems.length > 0 ? `Proceed to Pay ₹${grandTotal.toFixed(2)}` : 'Your Cart is Empty')}
        </button>
      </div>
    </div>
  );
};

export default AddressSelectionPage;