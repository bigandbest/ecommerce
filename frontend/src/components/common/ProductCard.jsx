"use client";
import React, { useState, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import { FaRupeeSign, FaSpinner } from "react-icons/fa";
import AddToCartButton from "@/components/common/AddToCartButton";
import ProductVariantModal from "@/components/common/ProductVariantModal";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const ProductCard = ({
  product,
  className = "",
  showDiscount = true,
  showBoughtBefore = true,
}) => {
  const [variants, setVariants] = useState([]);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [hasVariants, setHasVariants] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const router = useRouter();

  // Fetch variants when component mounts
  useEffect(() => {
    fetchVariants();
  }, [product.id]);

  const fetchVariants = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product-variants/product/${product.id}/variants`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.variants.length > 0) {
          setVariants(data.variants);
          setHasVariants(true);
        }
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  const handleVariantClick = () => {
    setShowVariantModal(true);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to buy now');
      router.push('/pages/login');
      return;
    }

    if (!window.Razorpay) {
      toast.error('Payment gateway not loaded. Please refresh the page.');
      return;
    }

    setBuyNowLoading(true);
    
    try {
      const totalAmount = product.price + (product.shipping_amount || 0);
      const orderId = `ORDER_${Date.now()}_${product.id}`;
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
        amount: totalAmount * 100, // Amount in paisa
        currency: 'INR',
        name: 'BigBestMart',
        description: `Buy Now - ${product.name}`,
        image: '/logo.png',
        order_id: orderId,
        
        prefill: {
          name: currentUser?.user_metadata?.name || 'Customer',
          email: currentUser?.email || 'customer@bigbestmart.com',
          contact: currentUser?.user_metadata?.phone || '9999999999'
        },
        
        theme: {
          color: '#FF6B00'
        },
        
        handler: function (response) {
          console.log('Payment successful:', response);
          toast.success(`Payment successful for ${product.name}!`);
          
          // You can add order creation logic here
          router.push(`/pages/payment-success?orderId=${orderId}&paymentId=${response.razorpay_payment_id}&amount=${totalAmount}&productName=${encodeURIComponent(product.name)}`);
          setBuyNowLoading(false);
        },
        
        modal: {
          ondismiss: function() {
            setBuyNowLoading(false);
            toast.info('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setBuyNowLoading(false);
      });

      rzp.open();
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment');
      setBuyNowLoading(false);
    }
  };
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 ${className}`}
    >
      {/* Product Image */}
      <div className="relative bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-2 sm:p-3 flex items-center justify-center h-28 sm:h-32">
        <img
          src={product.image || "/prod1.png"}
          alt={product.name}
          className="object-contain max-w-full max-h-full w-16 h-16 sm:w-20 sm:h-20"
          onError={(e) => {
            e.target.src = "/prod1.png";
          }}
        />
        {/* Discount Badge */}
        {showDiscount &&
          product.oldPrice &&
          product.oldPrice > product.price && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-green-600 text-white px-1 py-0.5 sm:px-1.5 sm:py-1 rounded text-xs font-bold leading-tight">
              {Math.round(
                ((product.oldPrice - product.price) / product.oldPrice) * 100
              )}
              %<br />
              OFF
            </div>
          )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-1.5 sm:p-2">
        <div className="text-center mb-1 sm:mb-2">
          {showBoughtBefore && (
            <p className="text-xs text-gray-500 mb-1">Bought Before</p>
          )}
          {product.weight && (
            <p className="text-xs sm:text-sm text-gray-600 mb-1">
              {product.weight}
            </p>
          )}
          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>

          {/* Rating (if available) */}
          {product.rating && (
            <div className="flex items-center justify-center mt-1">
              <div className="flex items-center">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-xs text-gray-600 ml-1">
                  {product.rating} ({product.reviews || 0})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Price Section */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex flex-col">
              {product.oldPrice && product.oldPrice > product.price && (
                <p className="text-xs text-gray-400 line-through">
                  ₹{product.oldPrice}
                </p>
              )}
              <p className="text-xs text-gray-500">
                ₹{product.price} + ₹{product.shipping_amount || 0} shipping
              </p>
              <p className="text-sm sm:text-base font-bold text-green-600">
                Total: ₹{(product.price + (product.shipping_amount || 0)).toFixed(2)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {hasVariants && (
                <button
                  onClick={handleVariantClick}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                  title="View pack sizes"
                >
                  <span className="text-xs font-medium text-gray-700">Sizes</span>
                  <IoChevronDown className="w-3 h-3 text-gray-600" />
                </button>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1">
            <div className="flex-1">
              <AddToCartButton
                product={product}
                size="small"
                showCheckoutButton={false}
              />
            </div>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock || buyNowLoading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-1.5 px-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              {buyNowLoading ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <>
                  <FaRupeeSign className="text-xs" />
                  <span>Buy Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Variant Modal */}
      <ProductVariantModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        variants={variants}
      />
    </div>
  );
};

export default ProductCard;
