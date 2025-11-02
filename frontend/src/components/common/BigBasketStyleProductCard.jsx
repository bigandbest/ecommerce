"use client";
import React, { useState, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import AddToCartButton from "@/components/common/AddToCartButton";

const BigBasketStyleProductCard = ({ product, className = "" }) => {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariants, setShowVariants] = useState(false);

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

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-visible shadow-sm hover:shadow-lg transition-all duration-300 relative ${className}`}>
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold z-10">
          ₹{displayData.oldPrice - displayData.price} OFF
        </div>
      )}

      {/* Product Image */}
      <div className="relative bg-gray-50 p-4 flex items-center justify-center h-40">
        <img
          src={product.image || "/prod1.png"}
          alt={product.name}
          className="object-contain max-w-full max-h-full"
          onError={(e) => { e.target.src = "/prod1.png"; }}
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Enhanced Pack Size Selector */}
        {hasVariants && (
          <div className="mb-3">
            <button
              onClick={() => setShowVariants(!showVariants)}
              className={`w-full flex items-center justify-between p-3 border-2 rounded-lg transition-all duration-200 ${
                showVariants 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Pack Size:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {selectedVariant ? selectedVariant.variant_weight : displayData.weight || "1 kg"}
                </span>
              </div>
              <IoChevronDown className={`w-4 h-4 transition-all duration-300 ${
                showVariants ? 'rotate-180 text-green-600' : 'text-gray-400'
              }`} />
            </button>
          </div>
        )}

        {/* Price and Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
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
              <span className="text-xs text-green-600 font-medium">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          
          <AddToCartButton
            product={displayData}
            variant={selectedVariant}
            size="small"
            showCheckoutButton={false}
          />
        </div>

        {/* Delivery Info */}
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
          5 mins
        </div>
      </div>

      {/* BigBasket Style Variants Popup */}
      {showVariants && hasVariants && (
        <>
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowVariants(false)}
          />
          
          {/* Desktop: Dropdown below card */}
          <div className="hidden md:block absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-2xl z-50 max-h-80 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-green-200">
              <h4 className="text-sm font-semibold text-green-800 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Choose Pack Size
              </h4>
            </div>
            
            {/* Variants List */}
            <div className="max-h-64 overflow-y-auto">
              {variants.map((variant) => {
                const variantDiscount = variant.variant_old_price && variant.variant_old_price > variant.variant_price
                  ? Math.round(((variant.variant_old_price - variant.variant_price) / variant.variant_old_price) * 100)
                  : 0;
                
                const isSelected = selectedVariant?.id === variant.id;
                const isDefault = variant.is_default;

                return (
                  <div
                    key={variant.id}
                    className={`relative p-4 border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-l-green-500' 
                        : isDefault 
                        ? 'bg-yellow-50 border-l-4 border-l-yellow-400'
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedVariant(variant);
                      setShowVariants(false);
                    }}
                  >
                    {/* Selected/Default Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ✓ Selected
                        </span>
                      </div>
                    )}
                    {isDefault && !isSelected && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pr-20">
                      <div className="flex-1">
                        {/* Weight with Icon */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 font-bold text-xs">📦</span>
                          </div>
                          <span className="font-semibold text-gray-900 text-base">
                            {variant.variant_weight}
                          </span>
                          {variantDiscount > 0 && (
                            <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                              {variantDiscount}% OFF
                            </span>
                          )}
                        </div>
                        
                        {/* Price Section */}
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            ₹{variant.variant_price}
                          </span>
                          {variant.variant_old_price && variant.variant_old_price > variant.variant_price && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm text-gray-400 line-through">
                                ₹{variant.variant_old_price}
                              </span>
                              <span className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded">
                                Save ₹{variant.variant_old_price - variant.variant_price}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Stock & Delivery Info */}
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center text-green-600">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                            5 mins delivery
                          </span>
                          {variant.variant_stock <= 5 && variant.variant_stock > 0 ? (
                            <span className="text-orange-600 font-semibold bg-orange-100 px-2 py-1 rounded">
                              ⚡ Only {variant.variant_stock} left
                            </span>
                          ) : variant.variant_stock > 5 ? (
                            <span className="text-green-600 font-medium">
                              ✅ In Stock
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold">
                              ❌ Out of Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Add Button */}
                    <div className="absolute bottom-4 right-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVariant(variant);
                          setShowVariants(false);
                        }}
                        disabled={variant.variant_stock === 0}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-sm ${
                          variant.variant_stock === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transform hover:scale-105 shadow-lg'
                        }`}
                      >
                        {variant.variant_stock === 0 ? '❌ Out of Stock' : '🛒 Add'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 px-4 py-2 text-center">
              <span className="text-xs text-gray-500">💡 Tap any option to select</span>
            </div>
          </div>

          {/* Mobile: Bottom Sheet Modal */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[70vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Mobile Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-50 p-2 flex items-center justify-center">
                  <img
                    src={product.image || "/prod1.png"}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                  <p className="text-xs text-gray-500">Choose pack size</p>
                </div>
              </div>
              <button
                onClick={() => setShowVariants(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Mobile Variants List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {variants.map((variant) => {
                  const variantDiscount = variant.variant_old_price && variant.variant_old_price > variant.variant_price
                    ? Math.round(((variant.variant_old_price - variant.variant_price) / variant.variant_old_price) * 100)
                    : 0;

                  const isSelected = selectedVariant?.id === variant.id;

                  return (
                    <div
                      key={variant.id}
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setShowVariants(false);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 text-lg">
                              {variant.variant_weight}
                            </span>
                            {variantDiscount > 0 && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                                ₹{variant.variant_old_price - variant.variant_price} OFF
                              </span>
                            )}
                            {isSelected && (
                              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                                Selected
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl font-bold text-gray-900">
                              ₹{variant.variant_price}
                            </span>
                            {variant.variant_old_price && variant.variant_old_price > variant.variant_price && (
                              <span className="text-sm text-gray-400 line-through">
                                ₹{variant.variant_old_price}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                              5 mins
                            </span>
                            {variant.variant_stock <= 5 && variant.variant_stock > 0 && (
                              <span className="text-orange-600 font-medium">
                                Only {variant.variant_stock} left
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVariant(variant);
                            setShowVariants(false);
                          }}
                          disabled={variant.variant_stock === 0}
                          className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
                            variant.variant_stock === 0
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {variant.variant_stock === 0 ? 'Out of Stock' : 'Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BigBasketStyleProductCard;