"use client";
import React, { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import AddToCartButton from "@/components/common/AddToCartButton";

// Add slide-up animation styles
const slideUpStyles = `
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = slideUpStyles;
  document.head.appendChild(styleSheet);
}

const UniqueVariantCard = ({ product, className = "" }) => {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariants, setShowVariants] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const popupRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (product.mockVariants && product.mockVariants.length > 0) {
      setVariants(product.mockVariants);
      const defaultVariant = product.mockVariants.find(v => v.is_default) || product.mockVariants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product.id, product.mockVariants]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showVariants && cardRef.current && !cardRef.current.contains(event.target)) {
        setShowVariants(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape' && showVariants) {
        setShowVariants(false);
      }
    };

    if (showVariants) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showVariants]);

  const displayData = selectedVariant ? {
    ...product,
    price: selectedVariant.variant_price,
    oldPrice: selectedVariant.variant_old_price,
    weight: selectedVariant.variant_weight,
    stock: selectedVariant.variant_stock,
    inStock: selectedVariant.variant_stock > 0,
    shipping_amount: selectedVariant.shipping_amount
  } : product;

  const hasVariants = variants.length > 0;
  const discountPercent = displayData.oldPrice && displayData.oldPrice > displayData.price
    ? Math.round(((displayData.oldPrice - displayData.price) / displayData.oldPrice) * 100)
    : 0;

  return (
    <div 
      ref={cardRef}
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full flex flex-col relative border border-gray-100 ${showVariants ? 'overflow-visible' : ''} ${className}`}
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold z-10 shadow-lg">
          {discountPercent}% OFF
        </div>
      )}

      {/* Product Image */}
      <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 p-4 flex items-center justify-center h-40">
        <img
          src={product.image || "/prod1.png"}
          alt={product.name}
          className="object-contain max-w-full max-h-full"
          onError={(e) => { e.target.src = "/prod1.png"; }}
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        {/* Brand Name */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
            {product.brand || "BigandBest"}
          </p>
        </div>

        {/* Product Name */}
        <div className="mb-2">
          <h3 className="font-bold text-[10px] sm:text-xs md:text-sm text-gray-800 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </div>

        {/* Variant Badge */}
        {product.variant && (
          <div className="mb-2">
            <p className="text-[9px] sm:text-[10px] font-medium text-gray-700">
              {product.variant}
            </p>
          </div>
        )}

        {/* Weight Display with Arrow */}
        {displayData.weight && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-[8px] sm:text-[9px] text-gray-500">
              {displayData.weight}
            </p>
            {hasVariants && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVariants(!showVariants);
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoChevronDown 
                  className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                    showVariants ? 'rotate-180' : ''
                  }`} 
                />
              </button>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-bold text-xs sm:text-sm md:text-base text-gray-900">
              ₹{displayData.price}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500 line-through">
              ₹{displayData.oldPrice}
            </span>
          </div>
          <div className="bg-green-100 text-green-700 text-[8px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-md inline-block">
            Save ₹{(displayData.oldPrice - displayData.price).toFixed(0)}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${
                  i <= Math.round(product.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 0 0 .95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 0 0-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 0 0-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 0 0-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 0 0 .95-.69l1.286-3.967z" />
              </svg>
            ))}
          </div>
          <span className="text-[8px] sm:text-[10px] text-gray-600 ml-1">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <AddToCartButton
              product={displayData}
              variant={selectedVariant}
              size="small"
              onAddToCart={(e) => e.stopPropagation()}
            />
          </div>
          <svg
            onClick={(e) => {
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
      </div>

      {/* Variant Overlay */}
      {showVariants && hasVariants && (
        <div 
          ref={popupRef}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-b-xl shadow-lg border border-gray-100 p-2 overflow-hidden z-50 animate-slide-up"
        >
          {/* Header with Close Button */}
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-gray-800 font-medium text-[9px] sm:text-[10px]">Choose Pack Size</h3>
            <button 
              onClick={() => setShowVariants(false)} 
              className="text-gray-500 hover:text-gray-700 p-0.5"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Pack Sizes */}
          <div className="space-y-0.5">
            {variants.map((variant, idx) => {
              const variantDiscount = variant.variant_old_price && variant.variant_old_price > variant.variant_price
                ? Math.round(((variant.variant_old_price - variant.variant_price) / variant.variant_old_price) * 100)
                : 0;
              
              return (
                <div
                  key={idx}
                  className="flex justify-between items-center border rounded-lg p-1 hover:bg-green-50 transition"
                >
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-medium text-gray-500">{variant.variant_weight}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-900 font-bold text-[9px] sm:text-[10px]">₹{variant.variant_price}</span>
                      {variant.variant_old_price && (
                        <span className="text-gray-500 line-through text-[8px] sm:text-[9px]">₹{variant.variant_old_price}</span>
                      )}
                    </div>
                    {variantDiscount > 0 && (
                      <div className="bg-green-100 text-green-700 text-[7px] sm:text-[8px] font-medium px-0.5 py-0.5 rounded-md inline-block mt-0.5">
                        Save ₹{(variant.variant_old_price - variant.variant_price).toFixed(0)}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedVariant(variant);
                      setShowVariants(false);
                    }}
                    className="bg-green-600 text-white text-[7px] px-1 py-0.5 rounded hover:bg-green-700 transition"
                  >
                    Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniqueVariantCard;