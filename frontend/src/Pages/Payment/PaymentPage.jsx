// src/pages/Checkout/PaymentPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocationContext } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { placeOrderWithDetailedAddress, getCartItems, removeCartItem } from '../../utils/supabaseApi';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import OrderSuccessModal from '../../components/OrderSuccessModal/OrderSuccessModal';

const PaymentPage = () => {
  const { currentUser } = useAuth();
  const { orderAddress, mapSelection } = useLocationContext();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentInProgress, setPaymentInProgress] = useState(false); // New loading state for payment
  const navigate = useNavigate();

  const [displaySubtotal, setDisplaySubtotal] = useState(0);
  const [displayShipping, setDisplayShipping] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);


  useEffect(() => {
    const subtotal = cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0);
    const shippingCost = subtotal > 1000 ? 0 : 50;
    const grandTotal = subtotal + shippingCost;

    setDisplaySubtotal(subtotal);
    setDisplayShipping(shippingCost);
    setDisplayTotal(grandTotal);
  }, [cartItems]); // This dependency array is key - the effect runs whenever cartItems changes


  useEffect(() => {
    console.log('Payment page - orderAddress:', orderAddress);
    if (!orderAddress) {
      console.log('No order address found, redirecting to address selection');
      navigate('/checkout/confirm-address');
      return;
    }

    const fetchCart = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }
      const cartRes = await getCartItems(currentUser.id);
      if (cartRes.success && cartRes.cartItems.length > 0) {
        setCartItems(cartRes.cartItems);
      } else {
        navigate('/cart');
      }
      setLoading(false);
    };

    fetchCart();
  }, [currentUser, orderAddress, navigate]);

  // Initial calculation (will be recalculated if items are removed)
  /* const initialGrandTotal = cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0) + (cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 1)), 0) > 1000 ? 0 : 50); */

  // COPIED: Function to check if items are deliverable
  const checkCartAvailability = async () => {
    try {
      if (!orderAddress?.postal_code) {
        return { error: "No valid delivery address selected." };
      }

      const items = cartItems.map((item) => ({ product_id: item.product_id || item.id }));

      const res = await axios.post(
        "https://ecommerce-8342.onrender.com/api/check/check-cart-availability",
        {
          latitude:  orderAddress.latitude,
          longitude: orderAddress.longitude,
          items
        }
      );

      // Assumes backend returns { success, deliverableProductIds, undeliverableProductIds }
      const { deliverableProductIds = [], undeliverableProductIds = [] } = res.data;

      const deliverableItems = cartItems.filter(item => deliverableProductIds.includes(item.product_id || item.id));
      const undeliverableItems = cartItems.filter(item => undeliverableProductIds.includes(item.product_id || item.id));

      return { deliverableItems, undeliverableItems };

    } catch (error) {
      console.error("Availability check error:", error);
      return { error: "Failed to verify delivery availability." };
    }
  };


  // NEW: The main orchestrator function for the payment button
  const handlePayment = async () => {
    console.log("Data at payment time:", { orderAddress, mapSelection });
    setPaymentInProgress(true);

    // Skip availability check - allow all items to be deliverable
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingCost = subtotal > 1000 ? 0 : 50;
    const grandTotal = subtotal + shippingCost;
    await initiatePayment(cartItems, subtotal, shippingCost, grandTotal);

    setPaymentInProgress(false);
  };

  // ✅ NEW: This useEffect triggers payment AFTER totals have been recalculated and state updated
  useEffect(() => {
    // This check ensures we only proceed to payment after the user has confirmed and items have been removed
    if (paymentInProgress && cartItems.length > 0) {
      // Find out if the original cart had more items than the current one
      // This is a simple way to know if we are in the "partial order" flow
      const originalCartLength = JSON.parse(sessionStorage.getItem('originalCartLength'));
      if (originalCartLength && cartItems.length < originalCartLength) {
        initiatePayment(cartItems, displaySubtotal, displayShipping, displayTotal);
      }
      sessionStorage.removeItem('originalCartLength'); // Clean up
    }
  }, [cartItems, paymentInProgress]); // Re-run when cartItems or payment status changes

  // Update handlePayment to store original cart length before any changes
  const originalHandlePayment = async () => {
    sessionStorage.setItem('originalCartLength', JSON.stringify(cartItems.length));
    await handlePayment();
  };


  // COPIED & COMPLETED: The full Razorpay payment logic
  const initiatePayment = async (itemsForOrder, finalSubtotal, finalShipping, finalTotal) => {
    /* const isAvailable = await checkCartAvailability();
    if (!isAvailable) return; */

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
      const res = await axios.post("https://ecommerce-8342.onrender.com/api/payment/create-order", {
        amount: finalTotal
      });
      const { order_id, amount } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "Big and Best Mart",
        description: "Order Payment",
        order_id,
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

          /* Payment Verification Directly from order Api now */
          /* const verification = await axios.post("https://ecommerce-8342.onrender.com/api/payment/verify-payment", {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
          });

          if (!verification.data.success) {
            alert("Payment verification failed. Please contact support.");
            return;
          } */

          const orderResponse = await placeOrderWithDetailedAddress(
            currentUser.id,
            itemsForOrder,
            finalSubtotal,
            finalShipping,
            finalTotal,
            detailedAddress,
            "razorpay",
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            mapSelection
          );

          if (orderResponse.success && orderResponse.order) {
            // Clear cart items from state to reflect the successful order
            setCartItems([]);
            setOrderDetails(orderResponse.order);
            setShowSuccessModal(true);
            
            // Dispatch event to notify other components about order placement
            window.dispatchEvent(new CustomEvent('orderPlaced', { 
              detail: { orderId: orderResponse.order.id } 
            }));
            console.log('Order placed successfully, event dispatched');
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

  if (loading) return <div className="text-center p-10">Loading Your Order...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Confirm Order & Pay</h1>

      {orderAddress && (
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Delivering To</h2>
          <div className="border p-4 rounded-md bg-gray-50 text-gray-800">
            <p className="font-bold">{orderAddress.address_name || 'Address'}</p>
            <p>{orderAddress.house_number || ''} {orderAddress.street_address || orderAddress.formatted_address || ''}</p>
            <p>{orderAddress.city || ''}, {orderAddress.state || ''} - {orderAddress.postal_code || ''}</p>
            <Link to="/checkout/confirm-address" className="text-blue-600 text-sm mt-2 inline-block hover:underline">Change Address</Link>
          </div>
        </div>
      )}

      <div className="border-t pt-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        
        {cartItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No items in cart. Redirecting...</p>
          </div>
        )}

        {/* NEW: Displaying each cart item */}
        <div className="space-y-4 mb-4">
          {cartItems.map(item => (
            <div key={item.cart_item_id} className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* ✅ FIXED: The entire summary now uses reactive state variables */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between"><span>Subtotal:</span> <span>₹{displaySubtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping:</span> <span>{displayShipping === 0 ? 'Free' : `₹${displayShipping.toFixed(2)}`}</span></div>
          <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Total:</span> <span>₹{displayTotal.toFixed(2)}</span></div>
        </div>
        {cartItems.length > 0 && orderAddress && (
          <button
            onClick={handlePayment}
            disabled={cartItems.length === 0 || paymentInProgress || loading || !orderAddress}
            className="w-full bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400"
          >
            {paymentInProgress ? 'Verifying...' : `Proceed to Pay ₹${displayTotal.toFixed(2)}`}
          </button>
        )}
        
        {(!orderAddress || cartItems.length === 0) && (
          <div className="text-center py-4 text-gray-500">
            {!orderAddress && <p>Please select a delivery address</p>}
            {cartItems.length === 0 && <p>Your cart is empty</p>}
          </div>
        )}
      </div>

      <OrderSuccessModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderDetails={orderDetails}
      />
    </div>
  );
};

export default PaymentPage;