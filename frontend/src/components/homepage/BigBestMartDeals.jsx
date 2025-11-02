"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaShoppingCart,
  FaEye,
} from "react-icons/fa";
import Link from "next/link";

const BigBestMartDeals = () => {
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const products = [
    {
      id: 1,
      image: "/prod1.png",
      name: "Premium Protein Powder",
      originalPrice: 25900,
      currentPrice: 19900,
      weight: "2 x 5 kg",
      variant: "Chocolate Flavor",
      description: "High-quality whey protein for muscle building",
      rating: 4.5,
      reviews: 128,
      discount: 23,
    },
    {
      id: 2,
      image: "/prod2.png",
      name: "Entrepreneur Supplement",
      originalPrice: 400000,
      currentPrice: 299000,
      weight: "1 Variant",
      variant: "Energy Booster",
      description: "All-out performance enhancement formula",
      rating: 4.2,
      reviews: 89,
      discount: 25,
    },
    {
      id: 3,
      image: "/prod3.png",
      name: "New Arrival Special",
      originalPrice: 4000,
      currentPrice: 2999,
      weight: "1 kg",
      variant: "Limited Edition",
      description: "Latest formula with enhanced benefits",
      rating: 4.7,
      reviews: 45,
      discount: 25,
    },
    {
      id: 4,
      image: "/prod4.png",
      name: "Custom Nutrition Plan",
      currentPrice: 200,
      weight: "1 Variant",
      variant: "Personalized",
      description: "Tailored nutrition consultation",
      rating: 4.8,
      reviews: 67,
      isEnquiry: true,
    },
    {
      id: 5,
      image: "/prod5.png",
      name: "Advanced Formula",
      originalPrice: 311,
      currentPrice: 200,
      weight: "1 Variant",
      variant: "Premium",
      description: "Scientific blend for optimal results",
      rating: 4.3,
      reviews: 92,
      discount: 36,
    },
    {
      id: 6,
      image: "/prod6.png",
      name: "Recovery Supplement",
      currentPrice: 100,
      weight: "1 Variant",
      variant: "Fast Acting",
      description: "Quick muscle recovery formula",
      rating: 4.1,
      reviews: 34,
    },
    {
      id: 7,
      image: "/prod7.png",
      name: "Gym Essential",
      currentPrice: 2500,
      variant: "Multi-Purpose",
      description: "Complete workout support",
      rating: 4.4,
      reviews: 78,
    },
    {
      id: 8,
      image: "/prod8.png",
      name: "Fitness Booster",
      originalPrice: 125,
      currentPrice: 100,
      weight: "1 Variant",
      variant: "Concentrated",
      description: "Enhanced performance supplement",
      rating: 4.6,
      reviews: 156,
      discount: 20,
    },
    {
      id: 9,
      image: "/prod9.png",
      name: "Premium Blend",
      originalPrice: 2800,
      currentPrice: 2200,
      weight: "1 Variant",
      variant: "Exclusive",
      description: "Top-tier nutrition supplement",
      rating: 4.9,
      reviews: 203,
      discount: 21,
    },
    {
      id: 10,
      image: "/prod10.png",
      name: "Ultimate Performance",
      originalPrice: 1500,
      currentPrice: 1200,
      weight: "500g",
      variant: "Pro Series",
      description: "Maximum strength formula for athletes",
      rating: 4.6,
      reviews: 174,
      discount: 20,
    },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-r from-green-400 to-green-600"></div>
              <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rotate-45 shadow-lg"></div>
            </div>
            <h2 className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent tracking-tight">
              BIGBESTMART DEALS
            </h2>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 sm:w-3 h-2 sm:h-3 bg-green-500 rotate-45 shadow-lg"></div>
              <div className="w-8 sm:w-12 h-0.5 bg-gradient-to-l from-green-400 to-green-600"></div>
            </div>
          </div>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Discover premium products at unbeatable prices - Limited time
            offers!
          </p>
        </div>

        {/* Products Grid - Mobile: 2 Rows with Horizontal Scroll, Desktop: Grid */}
        <div className="lg:hidden">
          {/* Mobile: 2 Rows with Horizontal Scrolling */}
          <div className="space-y-3">
            {/* First Row */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-2">
                {products.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex-shrink-0 w-40 sm:w-44"
                  >
                    {/* Product Image Container */}
                    <div className="relative h-32 sm:h-36 bg-white overflow-hidden">
                      {product.discount && (
                        <div className="absolute top-1 left-1 z-10 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          -{product.discount}%
                        </div>
                      )}
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-2.5 h-2.5 ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-200"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 0 0 .95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 0 0-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 0 0-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 0 0-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 0 0 .95-.69l1.286-3.967z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[9px] text-gray-500">({product.reviews})</span>
                      </div>
                      
                      {/* Variant and Weight */}
                      <div className="mb-1">
                        <p className="text-[9px] font-medium text-gray-700">{product.variant}</p>
                        {product.weight && (
                          <p className="text-[8px] text-gray-500">{product.weight}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(product.currentPrice)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <button className="w-full py-2 px-2 rounded text-xs font-semibold bg-orange-500 text-white">
                        {product.isEnquiry ? "ENQUIRY" : "ADD TO CART"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Second Row */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 pb-2">
                {products.slice(5, 10).map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex-shrink-0 w-40 sm:w-44"
                  >
                    <div className="relative h-32 sm:h-36 bg-white overflow-hidden">
                      {product.discount && (
                        <div className="absolute top-1 left-1 z-10 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          -{product.discount}%
                        </div>
                      )}
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 text-xs mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-2.5 h-2.5 ${
                                i < Math.floor(product.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-200"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 0 0 .95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 0 0-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 0 0-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 0 0-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 0 0 .95-.69l1.286-3.967z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[9px] text-gray-500">({product.reviews})</span>
                      </div>
                      
                      {/* Variant and Weight */}
                      <div className="mb-1">
                        <p className="text-[9px] font-medium text-gray-700">{product.variant}</p>
                        {product.weight && (
                          <p className="text-[8px] text-gray-500">{product.weight}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(product.currentPrice)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <button className="w-full py-2 px-2 rounded text-xs font-semibold bg-orange-500 text-white">
                        {product.isEnquiry ? "ENQUIRY" : "ADD TO CART"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Desktop Grid Layout */}
        <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2"
            >
              <div className="relative aspect-square bg-white overflow-hidden">
                {product.discount && (
                  <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    -{product.discount}%
                  </div>
                )}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300">
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    >
                      {favorites[product.id] ? (
                        <FaHeart className="w-4 h-4 text-red-500" />
                      ) : (
                        <FaRegHeart className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                    <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110">
                      <FaEye className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.reviews})
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    {product.variant}
                  </p>
                  {product.weight && (
                    <p className="text-xs text-gray-500">{product.weight}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.currentPrice)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <button
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg ${
                    product.isEnquiry
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {product.isEnquiry ? (
                      <>
                        <FaEye className="w-4 h-4" />
                        ENQUIRY
                      </>
                    ) : (
                      <>
                        <FaShoppingCart className="w-4 h-4" />
                        ADD TO CART
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-12">
          <Link href="/pages/categories">
            <button className="bg-[#FF6B00] hover:bg-[#e65c00] text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base">
              View All →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BigBestMartDeals;
