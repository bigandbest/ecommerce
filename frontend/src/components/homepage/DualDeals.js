"use client";
import { useState, useRef } from "react";
import Image from "next/image";

const DualDeals = () => {
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);

  const leftCategories = [
    {
      id: 1,
      name: "Audio Gear & Watches",
      discount: "UP TO 90% OFF",
      image: "/comp1.svg",
      originalPrice: "₹2,999",
      salePrice: "₹299",
    },
    {
      id: 2,
      name: "Home & Kitchen Appliances",
      discount: "UP TO 80% OFF",
      image: "/comp2.svg",
      originalPrice: "₹4,999",
      salePrice: "₹999",
    },
    {
      id: 3,
      name: "Tech Accessories",
      discount: "UP TO 75% OFF",
      image: "/comp3.svg",
      originalPrice: "₹1,999",
      salePrice: "₹499",
    },
    {
      id: 4,
      name: "Charging Needs",
      discount: "UP TO 80% OFF",
      image: "/comp4.svg",
      originalPrice: "₹1,499",
      salePrice: "₹299",
    },
    {
      id: 5,
      name: "Personal Care & Grooming",
      discount: "UP TO 80% OFF",
      image: "/comp5.svg",
      originalPrice: "₹3,999",
      salePrice: "₹799",
    },
  ];

  const rightCategories = [
    {
      id: 1,
      name: "Luscious Lips",
      discount: "UP TO 40% OFF",
      image: "/comp1.svg",
      originalPrice: "₹1,299",
      salePrice: "₹779",
    },
    {
      id: 2,
      name: "Flawless Face",
      discount: "UP TO 45% OFF",
      image: "/comp2.svg",
      originalPrice: "₹2,499",
      salePrice: "₹1,374",
    },
    {
      id: 3,
      name: "Dazzling Eyes",
      discount: "UP TO 60% OFF",
      image: "/comp3.svg",
      originalPrice: "₹1,999",
      salePrice: "₹799",
    },
    {
      id: 4,
      name: "Nails & more",
      discount: "UP TO 50% OFF",
      image: "/comp4.svg",
      originalPrice: "₹899",
      salePrice: "₹449",
    },
    {
      id: 5,
      name: "Korean Beauty",
      discount: "UP TO 60% OFF",
      image: "/comp5.svg",
      originalPrice: "₹3,999",
      salePrice: "₹1,599",
    },
  ];

  const scroll = (direction, ref) => {
    const container = ref.current;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[420px]">
        {/* Left Section - Best Selling Deals */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
          </div>

          {/* Header Section */}
          <div className="relative z-10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full mb-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-blue-200 text-xs font-medium">
                    Electronics
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  Best Selling
                </h2>
                <h3 className="text-lg sm:text-xl text-blue-300 font-semibold mb-2">
                  TECH DEALS
                </h3>
                <p className="text-orange-400 text-sm font-bold">
                  UP TO 90% OFF
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left", leftScrollRef)}
                  className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label="Previous"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => scroll("right", leftScrollRef)}
                  className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
                  aria-label="Next"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Products Scroll Container */}
          <div
            ref={leftScrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {leftCategories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0 w-36 sm:w-40 lg:w-44 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl group"
              >
                {/* Product Image */}
                <div className="bg-white/10 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 group-hover:bg-white/15 transition-colors duration-300">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={100}
                    height={100}
                    className="w-full h-12 sm:h-14 lg:h-16 object-contain"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-1.5 sm:space-y-2">
                  <h4 className="text-white text-xs sm:text-sm font-semibold leading-tight line-clamp-2">
                    {category.name}
                  </h4>

                  {/* Price Section */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-green-400 text-xs sm:text-sm font-bold">
                        {category.salePrice}
                      </span>
                      <span className="text-gray-400 text-xs line-through">
                        {category.originalPrice}
                      </span>
                    </div>
                    <div className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-500/20 border border-orange-400/30 rounded-md">
                      <span className="text-orange-300 text-xs font-bold">
                        {category.discount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section - Trending Beauty */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-pink-300/30 to-rose-300/30" />
          </div>

          {/* Header Section */}
          <div className="relative z-10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/20 backdrop-blur-md border border-pink-400/30 rounded-full mb-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                  <span className="text-pink-700 text-xs font-medium">
                    Beauty
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-pink-800 mb-1">
                  Trending Now
                </h2>
                <h3 className="text-lg sm:text-xl text-rose-600 font-semibold mb-2">
                  BEAUTY FEST
                </h3>
                <p className="text-red-600 text-sm font-bold">UP TO 60% OFF</p>
              </div>

              {/* Navigation Controls */}
              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left", rightScrollRef)}
                  className="w-10 h-10 bg-pink-500/20 backdrop-blur-md border border-pink-400/30 rounded-full flex items-center justify-center text-pink-700 hover:bg-pink-500/30 transition-all duration-300 hover:scale-110"
                  aria-label="Previous"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => scroll("right", rightScrollRef)}
                  className="w-10 h-10 bg-pink-500/20 backdrop-blur-md border border-pink-400/30 rounded-full flex items-center justify-center text-pink-700 hover:bg-pink-500/30 transition-all duration-300 hover:scale-110"
                  aria-label="Next"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Products Scroll Container */}
          <div
            ref={rightScrollRef}
            className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {rightCategories.map((category) => (
              <div
                key={category.id}
                className="flex-shrink-0 w-36 sm:w-40 lg:w-44 bg-white/60 backdrop-blur-sm border border-pink-200/50 rounded-xl p-3 sm:p-4 hover:bg-white/80 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-xl group"
              >
                {/* Product Image */}
                <div className="bg-pink-100/70 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 group-hover:bg-pink-100 transition-colors duration-300">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={100}
                    height={100}
                    className="w-full h-12 sm:h-14 lg:h-16 object-contain"
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-1.5 sm:space-y-2">
                  <h4 className="text-gray-800 text-xs sm:text-sm font-semibold leading-tight line-clamp-2">
                    {category.name}
                  </h4>

                  {/* Price Section */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-green-600 text-xs sm:text-sm font-bold">
                        {category.salePrice}
                      </span>
                      <span className="text-gray-500 text-xs line-through">
                        {category.originalPrice}
                      </span>
                    </div>
                    <div className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500/20 border border-red-400/30 rounded-md">
                      <span className="text-red-600 text-xs font-bold">
                        {category.discount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualDeals;
