"use client";
import React, { useState, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import AddToCartButton from "@/components/common/AddToCartButton";

const ProductCardWithVariants = ({
  product,
  className = "",
  showDiscount = true,
  showBoughtBefore = true,
}) => {
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showVariants, setShowVariants] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch variants when component mounts
  useEffect(() => {
    // Check if product has mock variants (for static data)
    if (product.mockVariants && product.mockVariants.length > 0) {
      setVariants(product.mockVariants);
      const defaultVariant =
        product.mockVariants.find((v) => v.is_default) ||
        product.mockVariants[0];
      setSelectedVariant(defaultVariant);
      setLoading(false);
    } else {
      fetchVariants();
    }
  }, [product.id, product.mockVariants]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/product-variants/product/${product.id}/variants`;
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.variants) {
          setVariants(data.variants);
          // Set default variant or first variant
          const defaultVariant =
            data.variants.find((v) => v.is_default) || data.variants[0];
          setSelectedVariant(defaultVariant);
        } else {
          setVariants([]);
        }
      }
    } catch (error) {
      console.error("Error fetching variants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setShowVariants(false);
  };

  const toggleVariants = () => {
    setShowVariants(!showVariants);
  };

  // Use selected variant data or fallback to product data
  const displayData = selectedVariant
    ? {
        ...product,
        price: selectedVariant.variant_price,
        oldPrice: selectedVariant.variant_old_price,
        weight: selectedVariant.variant_weight,
        stock: selectedVariant.variant_stock,
        inStock: selectedVariant.variant_stock > 0,
      }
    : product;

  const hasVariants = variants.length > 0;

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 relative ${className}`}
    >
      {/* Product Image */}
      <div className="relative bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 p-2 sm:p-3 flex items-center justify-center h-28 sm:h-32">
        <img
          src={product.image || "/prod2.png"}
          alt={product.name}
          className="object-contain max-w-full max-h-full w-16 h-16 sm:w-20 sm:h-20"
          onError={(e) => {
            e.target.src = "/prod2.png";
          }}
        />
        {/* Discount Badge */}
        {showDiscount &&
          displayData.oldPrice &&
          displayData.oldPrice > displayData.price && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-green-600 text-white px-1 py-0.5 sm:px-1.5 sm:py-1 rounded text-xs font-bold leading-tight">
              {Math.round(
                ((displayData.oldPrice - displayData.price) /
                  displayData.oldPrice) *
                  100
              )}
              %<br />
              OFF
            </div>
          )}

        {/* Out of Stock Badge */}
        {!displayData.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-1.5 sm:p-2 relative">
        <div className="text-center mb-1 sm:mb-2">
          {showBoughtBefore && (
            <p className="text-xs text-gray-500 mb-1">Bought Before</p>
          )}

          <h3 className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Weight with Dropdown Arrow - Enhanced Style */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded-full">
              {selectedVariant
                ? selectedVariant.variant_weight
                : displayData.weight || "1 kg"}
            </span>
            {hasVariants && (
              <button
                onClick={toggleVariants}
                className="p-1 hover:bg-green-50 rounded-full transition-all duration-200 hover:scale-110"
              >
                <IoChevronDown
                  className={`w-3 h-3 text-green-600 transition-all duration-300 ${
                    showVariants ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>

          {/* Rating (if available) */}
          {product.rating && (
            <div className="flex items-center justify-center mb-2">
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
        <div className="flex items-center justify-between mb-1">
          <div className="flex flex-col">
            {displayData.oldPrice &&
              displayData.oldPrice > displayData.price && (
                <p className="text-xs text-gray-400 line-through">
                  ₹{displayData.oldPrice}
                </p>
              )}
            <p className="text-sm sm:text-base font-bold text-gray-900">
              ₹{displayData.price}
            </p>
          </div>
          <div className="flex-shrink-0">
            <AddToCartButton
              product={displayData}
              variant={selectedVariant}
              size="small"
              showCheckoutButton={false}
            />
          </div>
        </div>

        {/* Variants Modal - Enhanced Modern Style */}
        {showVariants && hasVariants && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-end justify-center z-50 sm:items-center sm:p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 p-2 flex items-center justify-center">
                    <img
                      src={product.image || "/prod1.png"}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {product.brand || "BigandBest"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVariants(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all duration-200"
                >
                  ×
                </button>
              </div>

              {/* Title */}
              <div className="p-4 pb-2">
                <h4 className="text-lg font-semibold text-gray-800">
                  Choose a Pack Size
                </h4>
              </div>

              {/* Variants List */}
              <div className="px-4 pb-4 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {variants.map((variant) => {
                    const discountPercent =
                      variant.variant_old_price &&
                      variant.variant_old_price > variant.variant_price
                        ? Math.round(
                            ((variant.variant_old_price -
                              variant.variant_price) /
                              variant.variant_old_price) *
                              100
                          )
                        : 0;

                    return (
                      <div
                        key={variant.id}
                        className={`border rounded-lg p-3 transition-all ${
                          variant.is_default
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {variant.variant_weight}
                              </span>
                              {discountPercent > 0 && (
                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                                  {discountPercent}% OFF
                                </span>
                              )}
                              {variant.variant_stock <= 5 &&
                                variant.variant_stock > 0 && (
                                  <span className="text-orange-600 text-xs">
                                    Only {variant.variant_stock} left
                                  </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                ₹{variant.variant_price}
                              </span>
                              {variant.variant_old_price &&
                                variant.variant_old_price >
                                  variant.variant_price && (
                                  <span className="text-sm text-gray-400 line-through">
                                    ₹{variant.variant_old_price}
                                  </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1 text-yellow-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                5 mins
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              handleVariantSelect(variant);
                              setShowVariants(false);
                            }}
                            disabled={variant.variant_stock === 0}
                            className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
                              variant.variant_stock === 0
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white"
                            }`}
                          >
                            {variant.variant_stock === 0
                              ? "Out of Stock"
                              : "Add"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCardWithVariants;
