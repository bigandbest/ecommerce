import React, { useState } from "react";
import Image from "next/image";

const ProductGrid = ({ products, onAddToCart, loading }) => {
  const [hoveredProduct, setHoveredProduct] = useState(null);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg sm:rounded-xl shadow-sm border animate-pulse"
          >
            <div className="aspect-square bg-gray-200 rounded-t-lg sm:rounded-t-xl"></div>
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
              <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 sm:h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 sm:h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-300 text-8xl mb-6">🛒</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          No products found
        </h3>
        <p className="text-gray-600 text-lg mb-8">
          Try adjusting your filters to discover more products.
        </p>
        <div className="flex justify-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <span className="w-2 h-2 bg-[#fd5b00] rounded-full"></span>
            <span>Try different groups</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Adjust price range</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-500">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            <span>Clear all filters</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg sm:rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden group"
          onMouseEnter={() => setHoveredProduct(product.id)}
          onMouseLeave={() => setHoveredProduct(null)}
        >
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.image || "/prod1.png"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.src = "/prod1.png";
              }}
            />

            {/* Discount Badge */}
            {product.oldPrice > product.price && (
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-bold shadow-lg">
                {Math.round(
                  ((product.oldPrice - product.price) / product.oldPrice) * 100
                )}
                % OFF
              </div>
            )}

            {/* Stock Status */}
            <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
              <span
                className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-medium ${
                  product.inStock
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-3 sm:p-4">
            {/* Product Name */}
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-2 leading-tight group-hover:text-[#fd5b00] transition-colors">
              {product.name}
            </h3>

            {/* Product Details */}
            {product.weight && (
              <p className="text-xs text-gray-500 mb-1 sm:mb-2 flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                {product.weight}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center mb-2 sm:mb-3">
              <div className="flex items-center bg-green-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                <span className="text-yellow-500 text-xs sm:text-sm">★</span>
                <span className="text-xs sm:text-sm text-gray-700 ml-1 font-medium">
                  {product.rating}
                </span>
              </div>
              <span className="text-xs text-gray-500 ml-2">
                ({product.reviews})
              </span>
            </div>

            {/* Price Section */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-baseline space-x-1 sm:space-x-2">
                <span className="text-sm sm:text-lg font-bold text-gray-900">
                  ₹{product.price}
                </span>
                {product.oldPrice > product.price && (
                  <span className="text-xs sm:text-sm text-gray-500 line-through">
                    ₹{product.oldPrice}
                  </span>
                )}
              </div>
              {product.oldPrice > product.price && (
                <span className="text-xs text-green-600 font-medium bg-green-50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                  Save ₹{product.oldPrice - product.price}
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={() => onAddToCart(product)}
              disabled={!product.inStock}
              className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                product.inStock
                  ? "bg-gradient-to-r from-[#fd5b00] to-[#f7941d] text-white hover:from-[#e65c00] hover:to-[#e6850d] transform hover:scale-105 shadow-md hover:shadow-lg"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {product.inStock ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M7 18h7"
                    />
                  </svg>
                  Add to Cart
                </span>
              ) : (
                "Out of Stock"
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
