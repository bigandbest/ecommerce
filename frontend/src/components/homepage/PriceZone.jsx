import React from "react";
import Image from "next/image";

const PriceZone = ({ sectionName }) => {
  const categories = [
    {
      name: "Bhai Dooj\nSpecials",
      image: "/prod1.png",
      offer: "Starting from ₹19",
    },
    { name: "Gifts For\nSister", image: "/prod2.png", offer: "Up to 80% off" },
    { name: "Get Ready", image: "/prod3.png", offer: "Up to 80% off" },
    { name: "Mithai &\nFruits", image: "/prod4.png", offer: "Up to 50% off" },
    { name: "Gifts for\nBrother", image: "/prod5.png", offer: "Up to 80% off" },
    {
      name: "Gifts For\nKids",
      image: "/prod6.png",
      offer: "Starting from ₹99",
    },
    { name: "Chocolates &\nMore", image: "/prod7.png", offer: "Up to 40% off" },
    { name: "Cook &\nServe", image: "/prod8.png", offer: "Up to 50% off" },
    { name: "Beauty &\nCare", image: "/prod9.png", offer: "Up to 60% off" },
    { name: "Home &\nDecor", image: "/prod10.png", offer: "Starting from ₹49" },
    {
      name: "Electronics\nDeals",
      image: "/prod11.png",
      offer: "Up to 70% off",
    },
    { name: "Fashion\nSale", image: "/prod12.png", offer: "Up to 85% off" },
    { name: "Sports &\nFitness", image: "/prod1.png", offer: "Up to 65% off" },
    {
      name: "Books &\nStationery",
      image: "/prod2.png",
      offer: "Starting from ₹29",
    },
    { name: "Toys &\nGames", image: "/prod3.png", offer: "Up to 75% off" },
    { name: "Health &\nWellness", image: "/prod4.png", offer: "Up to 55% off" },
  ];

  return (
    <div className="relative w-full" style={{ backgroundColor: "#D2691E" }}>
      {/* Decorative circles */}
      <div className="absolute top-8 left-16 w-16 h-16 bg-yellow-200 rounded-full opacity-40"></div>
      <div className="absolute top-12 right-20 w-12 h-12 bg-yellow-300 rounded-full opacity-50"></div>
      <div className="absolute bottom-32 left-8 w-20 h-20 bg-yellow-200 rounded-full opacity-30"></div>
      <div className="absolute bottom-16 right-12 w-14 h-14 bg-yellow-300 rounded-full opacity-40"></div>

      <div className="container mx-auto px-6 py-4 sm:py-4">
        {/* Header Section */}
        <div className="relative mb-6">
          <div
            className="relative mx-auto max-w-xs sm:max-w-4xl text-center py-6 sm:py-12 px-4 sm:px-8"
            style={{
              background:
                "linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)",
              borderRadius: "20px 20px 15px 15px",
              border: "2px solid #DAA520",
            }}
          >
            <div className="absolute top-3 left-4 w-4 h-4 sm:w-8 sm:h-8 bg-yellow-300 rounded-full opacity-70"></div>
            <div className="absolute top-3 right-4 w-4 h-4 sm:w-8 sm:h-8 bg-yellow-300 rounded-full opacity-70"></div>

            <p className="text-yellow-200 text-sm sm:text-xl font-bold mb-2 sm:mb-3 tracking-widest">
              CELEBRATE
            </p>
            <h1 className="text-yellow-100 text-2xl sm:text-5xl md:text-4xl font-extrabold mb-3 sm:mb-6 tracking-wide">
              {sectionName || "PRICE DEAL"}
            </h1>

            {/* Diya decorations */}
            <div className="absolute bottom-3 left-8 sm:bottom-6 sm:left-16">
              <div className="w-4 h-5 sm:w-8 sm:h-10 bg-yellow-400 rounded-b-full relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-2 sm:w-3 sm:h-4 bg-orange-500 rounded-t-full"></div>
              </div>
            </div>
            <div className="absolute bottom-3 right-8 sm:bottom-6 sm:right-16">
              <div className="w-4 h-5 sm:w-8 sm:h-10 bg-yellow-400 rounded-b-full relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1.5 h-2 sm:w-3 sm:h-4 bg-orange-500 rounded-t-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Cards Grid */}
        {/* Desktop: Single Row with Marquee */}
        <div className="hidden sm:block overflow-hidden px-2">
          <div className="flex gap-2 animate-marquee">
            {categories
              .slice(0, 10)
              .concat(categories.slice(0, 10))
              .map((category, index) => {
                return (
                  <div
                    key={index}
                    className="relative cursor-pointer hover:scale-105 transition-transform duration-300 w-32 flex-shrink-0 h-40"
                  >
                    <div className="relative">
                      <div
                        className="relative px-2 pt-2 pb-1 rounded-t-2xl"
                        style={{ backgroundColor: "#FFF8DC" }}
                      >
                        <h3 className="font-bold text-gray-800 text-xs mb-2 text-center leading-tight whitespace-pre-line">
                          {category.name}
                        </h3>
                        <div className="relative w-full h-12 mb-1">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div
                        className="text-white text-center py-1 rounded-b-2xl"
                        style={{ backgroundColor: "#8B4513" }}
                      >
                        <p className="font-bold text-xs">{category.offer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Mobile: Two Rows with Marquee */}
        <div className="sm:hidden space-y-3 overflow-hidden px-2">
          {/* First Row */}
          <div className="flex gap-2 animate-marquee">
            {categories
              .slice(0, 4)
              .concat(categories.slice(0, 4))
              .map((category, index) => {
                return (
                  <div
                    key={`mobile-row1-${index}`}
                    className="relative cursor-pointer hover:scale-105 transition-transform duration-300 w-20 flex-shrink-0 h-32"
                  >
                    <div className="relative">
                      <div
                        className="relative px-2 pt-2 pb-1 rounded-t-2xl"
                        style={{ backgroundColor: "#FFF8DC" }}
                      >
                        <h3 className="font-bold text-gray-800 text-[10px] mb-1 text-center leading-tight whitespace-pre-line">
                          {category.name}
                        </h3>
                        <div className="relative w-full h-10 mb-1">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div
                        className="text-white text-center py-1 rounded-b-2xl"
                        style={{ backgroundColor: "#8B4513" }}
                      >
                        <p className="font-bold text-[9px]">{category.offer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Second Row */}
          <div className="flex gap-2 animate-marquee">
            {categories
              .slice(4, 8)
              .concat(categories.slice(4, 8))
              .map((category, index) => {
                return (
                  <div
                    key={`mobile-row2-${index}`}
                    className="relative cursor-pointer hover:scale-105 transition-transform duration-300 w-20 flex-shrink-0 h-32"
                  >
                    <div className="relative">
                      <div
                        className="relative px-2 pt-2 pb-1 rounded-t-2xl"
                        style={{ backgroundColor: "#FFF8DC" }}
                      >
                        <h3 className="font-bold text-gray-800 text-[10px] mb-1 text-center leading-tight whitespace-pre-line">
                          {category.name}
                        </h3>
                        <div className="relative w-full h-10 mb-1">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div
                        className="text-white text-center py-1 rounded-b-2xl"
                        style={{ backgroundColor: "#8B4513" }}
                      >
                        <p className="font-bold text-[9px]">{category.offer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default PriceZone;
