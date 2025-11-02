"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/common/AddToCartButton";

const ProductCard2 = ({
  product,
  hovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  // Handle both mock data structure and database structure
  const productName = product.product_name || product.name || "Product Name";
  const productImage =
    product.product_image_main || product.image || "/prod1.png";
  const productPrice =
    product.discounted_single_product_price || parseFloat(product.price) || 0;
  const oldPrice =
    product.non_discounted_price ||
    parseFloat(product.oldPrice) ||
    parseFloat(product.old_price) ||
    productPrice * 1.2;
  const rating = product.review_stars || product.rating || 4.0;
  const reviews =
    product.no_of_reviews || product.reviews || product.review_count || 0;
  const inStock = product.in_stock !== false;

  // Calculate discount percentage
  const discountPercentage =
    oldPrice > productPrice
      ? Math.round(((oldPrice - productPrice) / oldPrice) * 100)
      : 0;

  // Generate variant and weight based on product name
  const getVariantInfo = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("protein"))
      return { variant: "Chocolate Flavor", weight: "1 kg" };
    if (lowerName.includes("paper"))
      return { variant: "A4 Size", weight: "500 sheets" };
    if (lowerName.includes("book"))
      return { variant: "Paperback", weight: "1 Edition" };
    if (lowerName.includes("bluetooth") || lowerName.includes("headphone"))
      return { variant: "Wireless", weight: "1 Variant" };
    if (lowerName.includes("lunch") || lowerName.includes("box"))
      return { variant: "Steel", weight: "2 Containers" };
    if (lowerName.includes("energy") || lowerName.includes("booster"))
      return { variant: "Pre-Workout", weight: "500g" };
    if (lowerName.includes("watch"))
      return { variant: "Fitness Tracker", weight: "1 Variant" };
    if (lowerName.includes("power") || lowerName.includes("bank"))
      return { variant: "Fast Charging", weight: "10000mAh" };
    return { variant: "Premium", weight: "1 Variant" };
  };

  const { variant, weight } = getVariantInfo(productName);

  // Format product data for the cart
  const cartItem = {
    id: product.id || product._id || Math.random().toString(36).substr(2, 9),
    name: productName,
    price: Number(productPrice),
    oldPrice: Number(oldPrice),
    image: productImage,
    rating: rating,
    reviews: reviews,
    inStock: inStock,
  };

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className={`rounded-[12px] border border-[#E0E0E0] transition-all duration-500 p-2 sm:p-4 md:p-6 w-full max-w-[180px] sm:max-w-[310px] md:max-w-[300px] lg:max-w-[260px] xl:max-w-[280px] flex flex-col relative items-start cursor-pointer
        ${!inStock ? "opacity-60" : ""}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ minHeight: "280px", height: "auto" }}
    >
      <div className="relative w-full mb-2 sm:mb-4">
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discountPercentage}%
          </div>
        )}
        <Image
          src={productImage}
          alt={productName}
          width={120}
          height={120}
          className="w-[120px] h-[120px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] object-contain mx-auto"
          priority={true}
          onError={(e) => {
            e.target.src = "/prod1.png"; // Fallback image
          }}
        />

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <span className="text-white font-bold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="flex w-full justify-between mb-2">
        <div className="flex flex-col justify-between flex-1">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xs sm:text-sm md:text-lg font-bold sm:font-extrabold text-[#222] leading-tight line-clamp-2 flex-1">
              {productName}
            </h2>
          </div>

          {/* Variant and Weight */}
          <div className="mb-2">
            <p className="text-xs font-medium text-gray-700">{variant}</p>
            <p className="text-[10px] text-gray-500">{weight}</p>
          </div>

          <div className="mb-2">
            <span className="text-sm sm:text-base font-bold sm:font-extrabold text-[#222]">
              ₹ {productPrice.toFixed(2)}
            </span>
            {oldPrice > productPrice && (
              <span className="text-xs sm:text-sm font-semibold text-[#ABA1A1] line-through ml-1 sm:ml-2">
                ₹{oldPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center mb-2 sm:mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 ${
              i <= Math.round(rating) ? "text-[#FFD600]" : "text-[#E0E0E0]"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 0 0 .95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 0 0-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 0 0-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 0 0-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 0 0 .95-.69l1.286-3.967z" />
          </svg>
        ))}
        <span className="text-[#222] font-bold text-[8px] sm:text-[10px] ml-1 sm:ml-2">
          {rating.toFixed(1)}
        </span>
        <span className="text-[#B0B0B0] text-[8px] sm:text-[10px] ml-1 hidden sm:inline">
          from {reviews} Reviews
        </span>
      </div>

      <div className="w-full gap-1 sm:gap-2 md:gap-4 mt-auto flex">
        <AddToCartButton
          product={cartItem}
          size="default"
          onAddToCart={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default ProductCard2;
