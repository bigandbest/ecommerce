"use client";
import React, { useState, useEffect } from "react";
import ProductCardWithVariants from "../common/ProductCardWithVariants";

const TopSeller = ({
  sectionName,
  sectionDescription,
  products: sectionProducts = [],
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use section products if available, otherwise fetch from API
    if (sectionProducts.length > 0) {
      setProducts(sectionProducts.slice(0, 5));
      setLoading(false);
    } else {
      fetchTopProducts();
    }
  }, [sectionProducts]);

  const fetchTopProducts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/productsroute/allproducts`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setProducts(data.products.slice(0, 5)); // Top 5 products
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container-responsive py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="mb-6 sm:mb-8 md:mb-12 lg:mb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-extrabold text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl text-[#222]">
            {sectionName || "Top Products"}
          </h2>
          {sectionDescription && (
            <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
              {sectionDescription}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 md:gap-6">
          <button className="bg-[#FF6B00] cursor-pointer text-white text-xs sm:text-sm md:text-base lg:text-xl font-extrabold rounded-full px-3 py-1 sm:px-4 sm:py-1.5 md:px-6 md:py-2 lg:px-8 focus:outline-none transition hover:bg-[#e65c00]">
            All Products
          </button>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div
          className="flex gap-2 sm:gap-4 pb-4"
          style={{ width: "max-content" }}
        >
          {loading
            ? // Loading skeleton
              Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="w-40 sm:w-64 flex-shrink-0">
                  <div className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
                </div>
              ))
            : products.map((product, idx) => (
                <div key={product.id} className="w-40 sm:w-64 flex-shrink-0">
                  <ProductCardWithVariants
                    product={product}
                    className={
                      hoveredIdx === null && idx === 0
                        ? "md:scale-105 z-10"
                        : hoveredIdx === idx
                        ? "md:scale-105 z-10"
                        : ""
                    }
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default TopSeller;
