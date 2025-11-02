"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/common/AddToCartButton";

const ProductCard = ({
  product,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  // Format product data for the cart
  const cartItem = {
    id: product.id,
    name: product.name,
    price: parseFloat((product.price || 0).toString().replace(/,/g, "")),
    oldPrice: parseFloat((product.oldPrice || 0).toString().replace(/,/g, "")),
    image: product.image,
    rating: product.rating,
    reviews: product.reviews,
    brand: product.brand,
    ...(product.inStock !== undefined && { inStock: product.inStock }),
    ...(product.in_stock !== undefined && { in_stock: product.in_stock }),
  };

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-2 sm:p-3 w-full flex flex-col relative border border-gray-100 cursor-pointer
        ${hovered ? "md:scale-105 z-10" : ""}
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

        <div className="mb-1">
          <h3 className="font-bold text-[10px] sm:text-xs md:text-sm text-gray-800 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </div>

        {/* Variant and Weight Specifications */}
        {(product.variant || product.weight) && (
          <div className="mb-2">
            {product.variant && (
              <p className="text-[9px] sm:text-[10px] font-medium text-gray-700">
                {product.variant}
              </p>
            )}
            {product.weight && (
              <p className="text-[8px] sm:text-[9px] text-gray-500">
                {product.weight}
              </p>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-bold text-xs sm:text-sm md:text-base text-gray-900">
              ₹{product.price}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-500 line-through">
              ₹{product.oldPrice}
            </span>
          </div>
          <div className="bg-green-100 text-green-700 text-[8px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-md inline-block">
            Save ₹
            {(
              parseFloat((product.oldPrice || 0).toString().replace(",", "")) -
              parseFloat((product.price || 0).toString().replace(",", ""))
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
            size="small"
            onAddToCart={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
