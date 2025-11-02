import React from "react";
import Image from "next/image";

const SubcategoryCard = ({ subcategory, categoryName, onSubcategoryClick }) => {
  const discountBadges = [
    "Up to 30% OFF",
    "Fresh & Quality",
    "Best Prices",
    "New Arrivals",
    "Premium Quality",
  ];

  const randomBadge =
    discountBadges[Math.floor(Math.random() * discountBadges.length)];

  return (
    <div
      className="relative group cursor-pointer transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 h-full min-h-[200px] sm:min-h-[280px]"
      onClick={() => onSubcategoryClick(subcategory)}
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl shadow-black/5" />

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fd5b00]/5 via-[#f7941d]/5 to-[#fd5b00]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content Container */}
      <div className="relative h-full p-4 sm:p-6 flex flex-col z-10">
        {/* Image Container */}
        <div className="flex-shrink-0 mb-3 sm:mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-white/30 group-hover:shadow-xl group-hover:shadow-[#fd5b00]/20 transition-all duration-300">
            <Image
              src={subcategory.image || "/prod1.png"}
              alt={subcategory.name}
              width={64}
              height={64}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                e.target.src = "/prod1.png";
              }}
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-grow flex flex-col justify-end space-y-2 sm:space-y-3">
          {/* Title */}
          <h3 className="text-sm sm:text-lg font-bold text-gray-800 group-hover:text-[#fd5b00] transition-colors duration-300 leading-tight">
            {subcategory.name}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
            {subcategory.description ||
              `Explore ${subcategory.name.toLowerCase()}`}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-200/50">
            <span className="text-xs font-medium text-gray-600">
              {subcategory.productCount || Math.floor(Math.random() * 50) + 10}{" "}
              items
            </span>
            <span className="text-xs text-gray-500 font-medium">Available</span>
          </div>
        </div>

        {/* Simple Arrow Icon */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-[#fd5b00] transition-colors duration-300"
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
        </div>
      </div>

      {/* Simple Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fd5b00]/0 to-[#f7941d]/0 group-hover:from-[#fd5b00]/5 group-hover:to-[#f7941d]/5 transition-all duration-300 rounded-2xl" />
    </div>
  );
};

export default SubcategoryCard;
