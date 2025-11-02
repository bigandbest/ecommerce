"use client";
import React, { useState, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import ProductVariantModal from "./ProductVariantModal";
import AddToCartButton from "./AddToCartButton";

const EnhancedProductCard = ({ product, className = "" }) => {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);

  useEffect(() => {
    if (product.mockVariants && product.mockVariants.length > 0) {
      setVariants(product.mockVariants);
      const defaultVariant = product.mockVariants.find(v => v.is_default) || product.mockVariants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product.id, product.mockVariants]);

  const displayData = selectedVariant ? {
    ...product,
    price: selectedVariant.variant_price,
    oldPrice: selectedVariant.variant_old_price,
    weight: selectedVariant.variant_weight,
    stock: selectedVariant.variant_stock,
    inStock: selectedVariant.variant_stock > 0,
  } : product;

  const hasVariants = variants.length > 0;
  const discountPercent = displayData.oldPrice && displayData.oldPrice > displayData.price
    ? Math.round(((displayData.oldPrice - displayData.price) / displayData.oldPrice) * 100)
    : 0;

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setShowVariantModal(false);
  };

  return (
    <>
      <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative group ${className}`}>
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-3 left-3 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-bold z-10">
            {discountPercent}% OFF
          </div>
        )}

        {/* Product Image */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center h-48 group-hover:scale-105 transition-transform duration-300">
          <img
            src={product.image || "/prod1.png"}
            alt={product.name}
            className="object-contain max-w-full max-h-full"
            onError={(e) => { e.target.src = "/prod1.png"; }}
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Pack Size Selector - BigBasket Style */}
          {hasVariants && (
            <div className="mb-4">
              <button
                onClick={() => setShowVariantModal(true)}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                    {selectedVariant ? selectedVariant.variant_weight : displayData.weight || "1 kg"}
                  </span>
                </div>
                <IoChevronDown className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
              </button>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-gray-900">
                  ₹{displayData.price}
                </span>
                {displayData.oldPrice && displayData.oldPrice > displayData.price && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{displayData.oldPrice}
                  </span>
                )}
              </div>
              {discountPercent > 0 && (
                <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                  Save ₹{displayData.oldPrice - displayData.price}
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              5 mins
            </div>
            
            <AddToCartButton
              product={displayData}
              variant={selectedVariant}
              size="medium"
              showCheckoutButton={false}
            />
          </div>

          {/* Stock Info */}
          {displayData.stock <= 5 && displayData.stock > 0 && (
            <div className="mt-2 text-xs text-orange-600 font-medium">
              Only {displayData.stock} left in stock
            </div>
          )}
        </div>
      </div>

      {/* Variant Selection Modal */}
      <ProductVariantModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        product={product}
        variants={variants}
        selectedVariant={selectedVariant}
        onVariantSelect={handleVariantSelect}
      />
    </>
  );
};

export default EnhancedProductCard;