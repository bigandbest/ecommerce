"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IoChevronDown } from "react-icons/io5";
import AddToCartButton from "@/components/common/AddToCartButton";

const NewArrivalCard = ({
  product,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
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

  // Format product data for the cart
  const cartItem = {
    id: product.id,
    name: product.name,
    price: parseFloat((displayData.price || 0).toString().replace(/,/g, "")),
    oldPrice: parseFloat((displayData.oldPrice || 0).toString().replace(/,/g, "")),
    image: product.image,
    rating: product.rating,
    reviews: product.reviews,
    brand: product.brand,
    inStock: displayData.inStock,
  };

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-2 sm:p-3 w-full flex flex-col relative border border-gray-100 cursor-pointer
        ${hovered ? "md:scale-105" : ""} ${showVariants ? "z-50" : "z-10"}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Product Image */}
      <div className="bg-gray-50 rounded-lg p-1 sm:p-2 mb-2 sm:mb-3">
        {product.image && product.image.includes('supabase.co') ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-20 sm:h-24 md:h-32 lg:h-36 object-contain"
            onError={(e) => {
              e.target.src = "/prod1.png";
            }}
          />
        ) : (
          <Image
            src={product.image || "/prod1.png"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-20 sm:h-24 md:h-32 lg:h-36 object-contain"
          />
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1">
        {/* Brand Name */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
            {product.brand || "BigandBest"}
          </p>
        </div>

        {/* Product Name with Arrow for Variants */}
        <div className="mb-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[10px] sm:text-xs md:text-sm text-gray-800 line-clamp-2 leading-tight flex-1">
              {product.name}
            </h3>
            {hasVariants && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVariants(!showVariants);
                }}
                className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <IoChevronDown 
                  className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
                    showVariants ? 'rotate-180' : ''
                  }`} 
                />
              </button>
            )}
          </div>
        </div>

        {/* Variant and Weight Specifications */}
        {(product.variant || displayData.weight) && (
          <div className="mb-2">
            {product.variant && (
              <p className="text-[9px] sm:text-[10px] font-medium text-gray-700">
                {product.variant}
              </p>
            )}
            {displayData.weight && (
              <p className="text-[8px] sm:text-[9px] text-gray-500">
                {displayData.weight}
              </p>
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
            Save ₹
            {(
              parseFloat((displayData.oldPrice || 0).toString().replace(",", "")) -
              parseFloat((displayData.price || 0).toString().replace(",", ""))
            ).toFixed(0)}
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
        <div className="w-full">
          <AddToCartButton
            product={cartItem}
            variant={selectedVariant}
            size="small"
            onAddToCart={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Variants Dropdown */}
      {showVariants && hasVariants && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] max-h-48 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-700 mb-2">
              Select Variant:
            </div>
            {variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              const variantDiscount = variant.variant_old_price && variant.variant_old_price > variant.variant_price
                ? Math.round(((variant.variant_old_price - variant.variant_price) / variant.variant_old_price) * 100)
                : 0;

              return (
                <div
                  key={variant.id}
                  className={`p-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                    isSelected 
                      ? 'bg-green-50 border border-green-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(variant);
                    setShowVariants(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-900">
                        {variant.variant_weight}
                      </div>
                      <div className="text-xs text-gray-600">
                        ₹{variant.variant_price}
                        {variant.variant_old_price && (
                          <span className="ml-1 line-through text-gray-400">
                            ₹{variant.variant_old_price}
                          </span>
                        )}
                      </div>
                    </div>
                    {variantDiscount > 0 && (
                      <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium">
                        {variantDiscount}% OFF
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewArrivalCard;