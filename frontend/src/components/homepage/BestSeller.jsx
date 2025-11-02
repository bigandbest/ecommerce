"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import UniqueVariantCard from "@/components/common/UniqueVariantCard";
import { productService } from "../../services/productService";

const BestSeller = () => {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopSaleProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedProducts = await productService.getQuickPicks(
          5,
          "top_sale"
        );
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching top sale products:", err);
        setError("Failed to load top sale products");
      } finally {
        setLoading(false);
      }
    };

    fetchTopSaleProducts();
  }, []);

  return (
    <section className="container-responsive py-12 sm:py-16 md:py-20">
      <div className="mb-8 sm:mb-12 md:mb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-[#222]">
          Best Sellers
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <Link href="/pages/categories">
            <button className="bg-[#FF6B00] cursor-pointer text-white text-sm sm:text-base md:text-xl font-extrabold rounded-full px-4 py-1.5 sm:px-6 sm:py-2 md:px-8 focus:outline-none transition hover:bg-[#e65c00]">
              All Products
            </button>
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <div
          className="flex gap-2 sm:gap-4 pb-4"
          style={{ width: "max-content" }}
        >
          {loading ? (
            Array.from({ length: 5 }, (_, idx) => (
              <div key={idx} className="w-40 sm:w-64 flex-shrink-0">
                <div className="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
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
                className="w-40 sm:w-64 flex-shrink-0"
              >
                <UniqueVariantCard
                  product={product}
                  className={`${
                    hoveredIdx === null
                      ? idx === 0
                        ? "md:scale-105 z-10"
                        : ""
                      : hoveredIdx === idx
                      ? "md:scale-105 z-10"
                      : ""
                  }`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
