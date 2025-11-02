"use client";
import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const DiscountCorner = ({ sectionName }) => {
  const discountCategories = [
    {
      name: "Audio Gear &\nWatches",
      discount: "UP TO 90%\nOFF",
      color: "text-orange-400",
    },
    {
      name: "Home &\nKitchen\nAppliances",
      discount: "UP TO 80%\nOFF",
      color: "text-orange-400",
    },
    {
      name: "Tech\nAccessories",
      discount: "UP TO 75%\nOFF",
      color: "text-orange-400",
    },
    {
      name: "Charging\nNeeds",
      discount: "UP TO 80%\nOFF",
      color: "text-orange-400",
    },
    {
      name: "Personal Care\n& Grooming",
      discount: "UP TO 80%\nOFF",
      color: "text-orange-400",
    },
  ];

  const bargainCategories = [
    { name: "Allianz", discount: "UP TO 40%\nOFF", color: "text-white" },
    { name: "Playless Pack", discount: "UP TO 45%\nOFF", color: "text-white" },
    { name: "Dazzling Eyes", discount: "UP TO 60%\nOFF", color: "text-white" },
    { name: "Nails & more", discount: "UP TO 50%\nOFF", color: "text-white" },
    { name: "Korean Beauty", discount: "UP TO 60%\nOFF", color: "text-white" },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left: Discount Corner (Deal Zone Style - Black) */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full mb-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-blue-200 text-xs font-medium">
                    Electronics
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-1">
                  {sectionName || "Discount Corner"}
                </h2>
                <h3 className="text-lg sm:text-xl text-blue-300 font-semibold mb-2">
                  MEGA DEALS
                </h3>
                <p className="text-orange-400 text-sm sm:text-base font-bold">
                  UP TO 90% OFF
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110">
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110">
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {discountCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-2 sm:p-3 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
                >
                  <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 whitespace-pre-line leading-tight">
                    {category.name}
                  </p>
                  <p
                    className={`text-xs sm:text-sm font-bold whitespace-pre-line ${category.color}`}
                  >
                    {category.discount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Bargain Block (New Arrival Style - Pink) */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-2xl p-4 sm:p-6 text-gray-800 relative overflow-hidden shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-pink-300/30 to-rose-300/30" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/20 backdrop-blur-md border border-pink-400/30 rounded-full mb-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                  <span className="text-pink-700 text-xs font-medium">
                    Beauty
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-1 text-pink-800">
                  Bargain Block
                </h2>
                <h3 className="text-lg sm:text-xl text-rose-600 font-semibold mb-2">
                  BEAUTY FEST
                </h3>
                <p className="text-red-600 text-sm sm:text-base font-bold">
                  UP TO 60% OFF
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-pink-500/20 backdrop-blur-md border border-pink-400/30 rounded-full flex items-center justify-center text-pink-700 hover:bg-pink-500/30 transition-all duration-300 hover:scale-110">
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 bg-pink-500/20 backdrop-blur-md border border-pink-400/30 rounded-full flex items-center justify-center text-pink-700 hover:bg-pink-500/30 transition-all duration-300 hover:scale-110">
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {bargainCategories.map((category, idx) => (
                <div
                  key={idx}
                  className="bg-pink-500/20 backdrop-blur-sm border border-pink-300/50 rounded-xl p-2 sm:p-3 text-center hover:bg-pink-500/30 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
                >
                  <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-pink-800 whitespace-pre-line leading-tight">
                    {category.name}
                  </p>
                  <p
                    className={`text-xs sm:text-sm font-bold whitespace-pre-line ${category.color}`}
                  >
                    {category.discount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountCorner;
