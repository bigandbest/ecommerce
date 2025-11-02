"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import UniqueVariantCard from "../common/UniqueVariantCard";
import { productService } from "../../services/productService";

const NewArrivals = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await productService.getQuickPicks(
          5,
          "new_arrivals"
        );
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setError("Failed to load new arrivals");
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  // Add scroll indicator dots
  const scrollRef = React.useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-12 bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-900 mb-2">
              New Arrivals
            </h2>
          </div>
          <Link href="/pages/categories">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm sm:text-base font-semibold rounded-xl px-6 py-2.5 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              View All →
            </button>
          </Link>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div
            className="flex gap-4 sm:gap-6 pb-4"
            style={{ width: "max-content" }}
          >
            {loading ? (
              Array.from({ length: 5 }, (_, idx) => (
                <div key={idx} className="w-48 sm:w-64 md:w-72 flex-shrink-0">
                  <div className="bg-gray-200 animate-pulse rounded-2xl h-64"></div>
                </div>
              ))
            ) : error ? (
              <div className="flex items-center justify-center w-full h-64 text-gray-500">
                <p>{error}</p>
              </div>
            ) : (
              products.map((product, idx) => (
                <div
                  key={product.id || idx}
                  className="w-48 sm:w-64 md:w-72 flex-shrink-0"
                >
                  <div
                    className="group relative"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {idx === 0 && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                        NEW
                      </div>
                    )}
                    <UniqueVariantCard
                      product={product}
                      className={`transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                        hoveredIdx === idx
                          ? "scale-105 shadow-2xl"
                          : "shadow-lg"
                      } rounded-2xl overflow-hidden bg-white border border-gray-100`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
