/**
 * Brand Partners Component
 * Displays a carousel of brand partner logos
 */
"use client";

import React from "react";
import Image from "next/image";

const BrandPartners = () => {
  // Mock brand data - replace with actual API call
  const brands = [
    { id: 1, name: "Brand 1", logo: "/logos/brand1.png" },
    { id: 2, name: "Brand 2", logo: "/logos/brand2.png" },
    { id: 3, name: "Brand 3", logo: "/logos/brand3.png" },
    { id: 4, name: "Brand 4", logo: "/logos/brand4.png" },
    { id: 5, name: "Brand 5", logo: "/logos/brand5.png" },
  ];

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Our Brand Partners
          </h2>
          <p className="text-gray-600">Trusted by leading brands worldwide</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center justify-center">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              <div className="w-24 h-24 flex items-center justify-center bg-white rounded-lg shadow-sm">
                <span className="text-gray-400 text-sm text-center">
                  {brand.name}
                </span>
                {/* Replace with actual Image component when logos are available */}
                {/* <Image
                  src={brand.logo}
                  alt={brand.name}
                  width={80}
                  height={80}
                  className="object-contain"
                /> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandPartners;
