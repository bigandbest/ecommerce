import React from "react";
import { useLocation } from "react-router-dom";

const GroupBannerSlider = ({ count = 2, bannerUrl }) => {
  const location = useLocation();

  // Show only on Home route
  if (location.pathname !== "/") {
    return null;
  }

  // Category data with text + image
  const categoryData = [
    {
      id: 1,
      title: "Tea, Coffee & More",
      image: "https://i.postimg.cc/SN9xSrtV/bru-removebg-preview.png",
    },
    {
      id: 2,
      title: "Noodles, Pasta & Soups",
      image: "https://i.postimg.cc/Sx16n7qt/maggi-removebg-preview.png",
    },
    {
      id: 3,
      title: "Cleaning Essentials",
      image: "https://i.postimg.cc/4y2P5J2D/cleaning-removebg-preview.png",
    },
  ];

  return (
    <div className="space-y-8 md:hidden">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative rounded-xl shadow-md overflow-hidden p-2"
        >
          {/* Banner Background */}
          <div
            className="h-[310px] bg-contain bg-center rounded-xl flex flex-col justify-end"
            style={{
              backgroundImage: `url('${bannerUrl}')`,
            }}
          >
            {/* 3 Category Cards in a Row */}
            <div className="grid grid-cols-3 gap-2 w-full p-2">
              {categoryData.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl shadow flex flex-col justify-start items-center text-center p-2"
                >
                  {/* Text at Top */}
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    {cat.title}
                  </p>
                  {/* Image Below */}
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-16 h-16 object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Footer (Bank Offers or Note) */}
            <div className="bg-white w-[96%] mx-auto rounded-xl text-xs mb-2 sm:text-sm text-center py-2 font-semibold">
              Rainy Deals Inside
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupBannerSlider;
