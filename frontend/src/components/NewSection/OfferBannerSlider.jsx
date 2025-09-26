// First one
import React from "react";
import { useLocation } from "react-router-dom";

const OfferBannerSlider = ({ count = 2, bannerUrl }) => {
  const location = useLocation();

  // Show only on Home route
  if (location.pathname !== "/") {
    return null;
  }

  // Dummy offer data
  const offerData = [
    {
      id: 1,
      title: "Up to",
      highlight: "80% Off",
    },
    {
      id: 2,
      title: "Under",
      highlight: "₹99",
    },
    {
      id: 3,
      title: "Under",
      highlight: "₹199",
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
            className="h-[310px] bg-cover bg-center rounded-xl flex flex-col justify-end"
            style={{
              backgroundImage: `url('${bannerUrl}')`,
            }}
          >
            {/* Exactly 3 cards in a row */}
            <div className="grid grid-cols-3 gap-2 w-full p-1">
              {offerData.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-gradient-to-b from-white to-cyan-200 rounded-xl shadow h-28 flex flex-col justify-center items-center text-center"
                >
                  <h1 className="text-sm text-black">{offer.title}</h1>
                  <h1 className="sm:text-xl font-bold text-teal-600">
                    {offer.highlight}
                  </h1>
                </div>
              ))}
            </div>

            {/* Footer (Bank Offers or Note) */}
            <div className="bg-white w-[96%] mx-auto rounded-xl text-xs mb-2 sm:text-sm text-center py-2 border-t border-gray-200">
              <span className="mr-4">10% off on ₹499 </span>
              <span className="font-bold text-blue-600">HDFC BANK</span>
              <span className="ml-4">₹200 off on ₹2,000</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfferBannerSlider;
