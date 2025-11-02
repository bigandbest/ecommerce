"use client";
import React, { useState } from "react";
import Link from "next/link";
import UniqueVariantCard from "@/components/common/UniqueVariantCard";

const defaultProducts = [
  {
    id: 46,
    name: "Trec Core Line",
    image: "/prod1.png",
    price: 4029.5,
    oldPrice: 5029.5,
    rating: 4.5,
    reviews: 352,
    variant: "Recommended",
    weight: "2×4 kg",
    brand: "Trec Nutrition",
    mockVariants: [
      {
        variant_weight: "2 kg",
        variant_price: 3100,
        variant_old_price: 3700,
        variant_stock: 15,
        is_default: false,
      },
      {
        variant_weight: "2×4 kg",
        variant_price: 4029.5,
        variant_old_price: 5029.5,
        variant_stock: 10,
        is_default: true,
      },
      {
        variant_weight: "8 kg",
        variant_price: 7900,
        variant_old_price: 8900,
        variant_stock: 6,
        is_default: false,
      },
    ],
  },
  {
    id: 47,
    name: "Trec Core Line",
    image: "/prod2.png",
    price: 4029.5,
    oldPrice: 5029.5,
    rating: 4.5,
    reviews: 352,
    variant: "Expert Choice",
    weight: "1 Variant",
    brand: "Trec Nutrition",
    mockVariants: [
      {
        variant_weight: "1.5 kg",
        variant_price: 2900,
        variant_old_price: 3500,
        variant_stock: 18,
        is_default: false,
      },
      {
        variant_weight: "3 kg",
        variant_price: 4029.5,
        variant_old_price: 5029.5,
        variant_stock: 13,
        is_default: true,
      },
    ],
  },
  {
    id: 48,
    name: "Gold Standard whey",
    image: "/prod3.png",
    price: 4029.5,
    oldPrice: 5029.5,
    rating: 4.5,
    reviews: 352,
    variant: "Highly Rated",
    weight: "3×2 kg",
    brand: "Optimum Nutrition",
    mockVariants: [
      {
        variant_weight: "2 kg",
        variant_price: 3600,
        variant_old_price: 4300,
        variant_stock: 14,
        is_default: false,
      },
      {
        variant_weight: "3×2 kg",
        variant_price: 4029.5,
        variant_old_price: 5029.5,
        variant_stock: 8,
        is_default: true,
      },
      {
        variant_weight: "6 kg",
        variant_price: 8400,
        variant_old_price: 9400,
        variant_stock: 5,
        is_default: false,
      },
    ],
  },
  {
    id: 49,
    name: "Gold Standard whey",
    image: "/prod4.png",
    price: 4029.5,
    oldPrice: 5029.5,
    rating: 4.5,
    reviews: 352,
    variant: "Top Rated",
    weight: "2.5 kg",
    brand: "Optimum Nutrition",
    mockVariants: [
      {
        variant_weight: "2.5 kg",
        variant_price: 4029.5,
        variant_old_price: 5029.5,
        variant_stock: 21,
        is_default: true,
      },
      {
        variant_weight: "5 kg",
        variant_price: 7800,
        variant_old_price: 8800,
        variant_stock: 7,
        is_default: false,
      },
    ],
  },
  {
    id: 50,
    name: "Gold Standard whey",
    image: "/prod5.png",
    price: 4029.5,
    oldPrice: 5029.5,
    rating: 4.5,
    reviews: 352,
    variant: "Must Have",
    weight: "1 Variant",
    brand: "Optimum Nutrition",
    mockVariants: [
      {
        variant_weight: "2.3 kg",
        variant_price: 4029.5,
        variant_old_price: 5029.5,
        variant_stock: 25,
        is_default: true,
      },
    ],
  },
];

const RecommendedProducts = ({
  sectionName,
  sectionDescription,
  products = [],
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Use provided products or fallback to default products
  const displayProducts =
    products.length > 0 ? products.slice(0, 5) : defaultProducts.slice(0, 5);

  return (
    <section className="container-responsive py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="mb-6 sm:mb-8 md:mb-12 lg:mb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl text-[#222]">
            {sectionName || "Recommended Products"}
          </h2>
          {sectionDescription && (
            <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
              {sectionDescription}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-6">
          <Link href="/pages/categories">
            <button className="bg-[#FF6B00] cursor-pointer text-white text-xs sm:text-sm md:text-base lg:text-xl font-extrabold rounded-full px-3 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 lg:px-8 focus:outline-none transition hover:bg-[#e65c00]">
              All Products
            </button>
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div
          className="flex gap-2 sm:gap-4 pb-4"
          style={{ width: "max-content" }}
        >
          {displayProducts.map((product, idx) => (
            <div key={idx} className="w-40 sm:w-64 flex-shrink-0">
              <UniqueVariantCard
                product={product}
                className={`${
                  hoveredIdx === null
                    ? idx === 0
                      ? "md:scale-105 z-10"
                      : ""
                    : hoveredIdx === idx
                    ? "md:scale-105 z-10"
                    : ""
                }`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProducts;
