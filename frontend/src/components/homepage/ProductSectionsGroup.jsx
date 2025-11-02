"use client";
import React from "react";
import BigBestMartDeals from "./BigBestMartDeals";
import NewArrivals from "./NewArrivals";
import BestSeller from "./BestSeller";
import TrendingProducts from "./TrendingProducts";

const ProductSectionsGroup = () => {
  return (
    <div className="w-full px-3 sm:px-4 md:px-0">
      {/* Mobile: Two smaller cards per row, Desktop: Original layout */}
      <div className="block md:hidden space-y-4">
        {/* Deal Zone - Two Cards */}
        <div className="w-full">
          <BigBestMartDeals />
        </div>

        {/* New Arrivals - Two Cards */}
        <div className="w-full">
          <NewArrivals />
        </div>

        {/* Best Selling - Two Cards */}
        <div className="w-full">
          <BestSeller />
        </div>

        {/* Trending Now - Two Cards */}
        <div className="w-full">
          <TrendingProducts />
        </div>
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden md:flex flex-col space-y-6 lg:space-y-8">
        <BigBestMartDeals />
        <NewArrivals />
        <BestSeller />
        <TrendingProducts />
      </div>
    </div>
  );
};

export default ProductSectionsGroup;
