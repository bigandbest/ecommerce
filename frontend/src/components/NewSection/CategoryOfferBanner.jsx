import React from "react";
import { useLocation } from "react-router-dom";

const CategoryOfferBanner = ({ count = 1, bannerUrl }) => {
  const location = useLocation();

  // Show only on Home route
  if (location.pathname !== "/") {
    return null;
  }

  // Dummy category data
  const categoryData = [
    {
      id: 1,
      title: "Detergents & Bars",
      subtitle: "Up to 60% Off",
      image:
        "https://i.postimg.cc/nrDyCyq1/Screenshot-2025-09-03-175154-removebg-preview.png",
    },
    {
      id: 2,
      title: "Personal Care",
      subtitle: "Up to 60% Off",
      image:
        "https://i.postimg.cc/nrDyCyq1/Screenshot-2025-09-03-175154-removebg-preview.png",
    },
    {
      id: 3,
      title: "Women & Baby Care",
      subtitle: "Up to 60% Off",
      image:
        "https://i.postimg.cc/nrDyCyq1/Screenshot-2025-09-03-175154-removebg-preview.png",
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
            className="bg-cover bg-center rounded-xl flex flex-col justify-end aspect-[2/1] sm:aspect-[16/7] md:aspect-[16/6]"
            style={{
              backgroundImage: `url('${bannerUrl}')`,
            }}
          >
            {/* Exactly 3 cards in a row */}
            <div className="grid grid-cols-3 gap-1 h-[81%]">
              {categoryData.map((category, idx) => (
                <div
                  key={category.id}
                  className={`flex flex-col justify-center items-center text-center p-1 ${
                    idx !== categoryData.length - 1
                      ? "border-r border-gray-200"
                      : ""
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.title}
                    className="object-contain "
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryOfferBanner;
