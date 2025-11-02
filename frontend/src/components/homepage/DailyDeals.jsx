"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { dailyDealsService } from "../../services/dailyDealsService";

const DailyDeals = ({ sectionName, sectionDescription }) => {
  const [deals, setDeals] = useState([]);
  const [dealProducts, setDealProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBackArrow, setShowBackArrow] = useState(false);
  const [showForwardArrow, setShowForwardArrow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);
  const router = useRouter();

  const checkScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowBackArrow(scrollLeft > 10);
      setShowForwardArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      return () => container.removeEventListener("scroll", checkScrollButtons);
    }
  }, [checkScrollButtons]);

  // Fetch daily deals from API
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dailyDealsService.getAllDailyDeals();

        if (response.success) {
          // Filter only active deals and sort by sort_order
          const activeDeals = response.deals
            .filter((deal) => deal.active)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
          setDeals(activeDeals);

          // Fetch products for each deal
          const productsPromises = activeDeals.map(async (deal) => {
            try {
              const productsResponse =
                await dailyDealsService.getProductsForDailyDeal(deal.id);
              return { dealId: deal.id, products: productsResponse || [] };
            } catch (error) {
              console.error(
                `Error fetching products for deal ${deal.id}:`,
                error
              );
              return { dealId: deal.id, products: [] };
            }
          });

          const productsResults = await Promise.all(productsPromises);
          const productsMap = {};
          productsResults.forEach(({ dealId, products }) => {
            productsMap[dealId] = products;
          });

          setDealProducts(productsMap);
        } else {
          setError("Failed to fetch deals");
        }
      } catch (err) {
        console.error("Error fetching daily deals:", err);
        setError("Failed to load daily deals");
        // Fallback to empty array
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const scrollForward = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const scrollBackward = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  // Touch/drag handlers for mobile
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = "grab";
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 xl:px-12 w-full py-8 sm:py-12 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              {sectionName || "Daily Deals"}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 hidden sm:block">
              {sectionDescription || "Limited time offers on trending products"}
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={scrollBackward}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border-2 border-orange-500 ${
                showBackArrow
                  ? "bg-orange-500 text-white hover:bg-orange-600 hover:scale-105"
                  : "bg-white text-gray-400 cursor-not-allowed opacity-50"
              }`}
              disabled={!showBackArrow}
              aria-label="Scroll left"
            >
              <span className="text-lg sm:text-xl font-bold">←</span>
            </button>
            <button
              onClick={scrollForward}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border-2 border-orange-500 ${
                showForwardArrow
                  ? "bg-orange-500 text-white hover:bg-orange-600 hover:scale-105"
                  : "bg-white text-gray-400 cursor-not-allowed opacity-50"
              }`}
              disabled={!showForwardArrow}
              aria-label="Scroll right"
            >
              <span className="text-lg sm:text-xl font-bold">→</span>
            </button>
          </div>
        </div>

        {/* Deals Container */}
        <div
          ref={scrollContainerRef}
          className={`overflow-x-auto scrollbar-hide select-none pb-4 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-3 sm:gap-4 lg:gap-6 w-max">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md flex-shrink-0 w-40 sm:w-48 md:w-56 lg:w-64 h-auto min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px] animate-pulse"
                >
                  <div className="h-32 sm:h-36 md:h-40 lg:h-44 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-3 sm:p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              // Error state
              <div className="flex items-center justify-center w-full py-8">
                <div className="text-center">
                  <div className="text-red-500 text-lg mb-2">⚠️</div>
                  <p className="text-gray-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : deals.length === 0 ? (
              // No deals available
              <div className="flex items-center justify-center w-full py-8">
                <div className="text-center">
                  <div className="text-gray-500 text-lg mb-2">🎯</div>
                  <p className="text-gray-600">
                    No daily deals available right now
                  </p>
                  <p className="text-sm text-gray-400">
                    Check back later for amazing offers!
                  </p>
                </div>
              </div>
            ) : (
              // Render deals
              deals.map((deal, idx) => (
                <div
                  key={deal.id || idx}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group flex-shrink-0 transform hover:scale-[1.02] hover:-translate-y-1 w-40 sm:w-48 md:w-56 lg:w-64 h-auto min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px]"
                  onClick={() => router.push(`/daily-deals/${deal.id}`)}
                >
                  {/* Badge */}
                  <div className="relative">
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      {deal.badge || "DEAL"}
                    </div>

                    {/* Product Image Container */}
                    <div className="h-32 sm:h-36 md:h-40 lg:h-44 bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-xl overflow-hidden relative">
                      <Image
                        src={
                          deal.image_url ||
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE3NiIgdmlld0JveD0iMCAwIDI0MCAxNzYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMTc2IiBmaWxsPSIjZjNlNGVkIi8+Cjx0ZXh0IHg9IjEyMCIgeT0iODgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OTdhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+"
                        }
                        alt={deal.title}
                        width={240}
                        height={176}
                        className="object-contain w-full h-full p-3 sm:p-4 transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE3NiIgdmlld0JveD0iMCAwIDI0MCAxNzYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMTc2IiBmaWxsPSIjZjNlNGVkIi8+Cjx0ZXh0IHg9IjEyMCIgeT0iODgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OTdhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+";
                        }}
                      />

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white text-orange-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-sm transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          Shop Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors duration-300">
                      {deal.title}
                    </h3>
                    <div className="mb-1">
                      <span className="text-orange-600 font-bold text-sm sm:text-base">
                        {deal.discount || "Special Offer"}
                      </span>
                    </div>
                    <div className="flex text-yellow-400 mb-2">
                      {"★".repeat(5)}
                    </div>

                    {/* Mapped Products */}
                    {dealProducts[deal.id] &&
                    dealProducts[deal.id].length > 0 ? (
                      <div className="mb-2">
                        <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                          <span>Featured Products:</span>
                          <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-xs font-medium">
                            {dealProducts[deal.id].length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {dealProducts[deal.id]
                            .slice(0, 3)
                            .map((item, productIdx) => (
                              <div
                                key={item.product_id || productIdx}
                                className="bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded-full truncate max-w-full border border-orange-200"
                                title={
                                  item.products?.name ||
                                  `Product ${item.product_id}`
                                }
                              >
                                {item.products?.name ||
                                  `Product ${item.product_id}`}
                              </div>
                            ))}
                          {dealProducts[deal.id].length > 3 && (
                            <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-200">
                              +{dealProducts[deal.id].length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-2">
                        <div className="text-xs text-gray-400 italic">
                          No products mapped yet
                        </div>
                      </div>
                    )}

                    {/* Mobile touch indicator */}
                    <div className="w-6 h-1 bg-orange-400 rounded-full mx-auto mt-2 opacity-0 sm:hidden group-active:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile Scroll Hint */}
        <div className="flex justify-center mt-4 sm:hidden">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>👈</span>
            <span>Swipe for more deals</span>
            <span>👉</span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex justify-center mt-6 sm:mt-8">
          <div className="bg-orange-500 text-white px-4 sm:px-6 py-3 rounded-full shadow-lg">
            <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base font-medium">
              <span className="hidden sm:inline">⏰ Deal ends in:</span>
              <span className="sm:hidden">Ends in:</span>
              <div className="flex gap-1 sm:gap-2">
                <span className="bg-white/20 px-2 py-1 rounded text-xs sm:text-sm font-bold">
                  23h
                </span>
                <span className="bg-white/20 px-2 py-1 rounded text-xs sm:text-sm font-bold">
                  45m
                </span>
                <span className="bg-white/20 px-2 py-1 rounded text-xs sm:text-sm font-bold">
                  12s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default DailyDeals;
