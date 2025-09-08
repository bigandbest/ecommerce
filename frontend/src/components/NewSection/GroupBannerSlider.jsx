import React from "react";
import { useLocation } from "react-router-dom";

const GroupBannerSlider = ({ count = 2, bannerUrl }) => {
  const location = useLocation();

  if (location.pathname !== "/") {
    return null;
  }

  const categoryData = [
    {
      id: 1,
      title: "Tea, Coffee & More",
      image:
        "https://i.postimg.cc/cLZ5nN9D/BREWVIACOFFEE1-0a98abb2-338b-49fe-9bcf-12fa8e0c3a77-removebg-preview.png",
    },
    {
      id: 2,
      title: "Noodles, & Pasta",
      image: "https://i.postimg.cc/hvLXYwFG/815w-Zb-Q5b-GL-UF894-1000-QL80-removebg-preview.png",
    },
    {
      id: 3,
      title: "Cleaning Essentials",
      image: "https://i.postimg.cc/TY22Ghg0/8901396139102-7-removebg-preview.png",
    },
  ];

  return (
    <div className="md:hidden p-2 ">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative rounded-xl shadow-md overflow-hidden"
        >
          {/* Banner Background */}
          <div
            className="w-full bg-cover bg-center rounded-xl relative flex flex-col justify-end p-2"
            style={{
              backgroundImage: `url('${bannerUrl}')`,
              minHeight: "220px", // ensure banner has breathing space
            }}
          >
            {/* Category Cards */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              {categoryData.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-lg shadow flex flex-col items-center text-center p-1 sm:p-2"
                >
                  <p className="text-[9px] sm:text-xs font-medium text-gray-700 mb-1 leading-tight">
                    {cat.title}
                  </p>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-12 sm:w-16 object-contain"
                  />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-white w-[85%] mx-auto rounded-xl text-xs sm:text-sm text-center py-2 font-semibold">
              Rainy Deals Inside
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupBannerSlider;
