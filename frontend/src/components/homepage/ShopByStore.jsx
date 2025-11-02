"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import api from "../../services/api";
import { clearAuthToken } from "../../utils/clearStorage";

const ShopByStore = ({ sectionName, sectionDescription }) => {
  const [storeData, setStoreData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef(null);

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

  useEffect(() => {
    const fetchStores = async (retryCount = 0) => {
      try {
        console.log("Fetching recommended stores...", { retryCount });

        // Clear any problematic tokens before making the request
        if (retryCount === 0) {
          clearAuthToken();
        }

        const response = await api.get("/recommended-stores/active");
        console.log("Stores", response.data);

        if (response.data && response.data.recommendedStores) {
          setStoreData(response.data.recommendedStores);
        } else {
          console.warn("No recommendedStores in response, using fallback data");
          // Fallback data if API fails
          setStoreData([
            {
              id: 1,
              name: "Fresh Fruits",
              image_url: "/prod1.png",
              title: "Fresh Fruits",
            },
            {
              id: 2,
              name: "Vegetables",
              image_url: "/prod1.png",
              title: "Vegetables",
            },
            { id: 3, name: "Dairy", image_url: "/prod1.png", title: "Dairy" },
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch recommended stores:", {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data,
          retryCount,
        });

        // If it's a 400 error and first attempt, clear token and retry
        if (error.response?.status === 400 && retryCount === 0) {
          console.log("400 error detected, clearing token and retrying...");
          clearAuthToken();
          setTimeout(() => fetchStores(retryCount + 1), 500);
          return;
        }

        // Retry logic for network errors
        if (
          retryCount < 2 &&
          (!error.response || error.response.status >= 500)
        ) {
          console.log(`Retrying API call... (attempt ${retryCount + 1})`);
          setTimeout(
            () => fetchStores(retryCount + 1),
            1000 * (retryCount + 1)
          );
          return;
        }

        // Fallback data on error
        setStoreData([
          {
            id: 1,
            name: "Fresh Fruits",
            image_url: "/prod1.png",
            title: "Fresh Fruits",
          },
          {
            id: 2,
            name: "Vegetables",
            image_url: "/prod1.png",
            title: "Vegetables",
          },
          { id: 3, name: "Dairy", image_url: "/prod1.png", title: "Dairy" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchStores();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 xl:px-12 w-full py-8 sm:py-12 bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-0 sm:px-6 lg:px-8 xl:px-12 w-full py-8 sm:py-12 bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-1 sm:mb-2">
              {sectionName || "Shop by Store"}
            </h2>
            <p className="text-sm sm:text-base text-center text-gray-600 hidden sm:block">
              {sectionDescription || "Explore products by category"}
            </p>
          </div>
        </div>

        {/* Store Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4 lg:gap-6">
          {storeData.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center cursor-pointer group flex-shrink-0 transform hover:scale-105 transition-all duration-300"
            >
              {/* Circular Image Container */}
              <div className="relative mb-3 sm:mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28  overflow-hidden  transition-all duration-300 ">
                  <Image
                    src={item.image_url || "/prod1.png"}
                    alt={item.title || item.name || "Store image"}
                    width={112}
                    height={112}
                    className="w-full h-full object-contain p-2 sm:p-3 transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/prod1.png";
                    }}
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="px-1 mt-2">
                <h3 className="text-xs sm:text-base md:text-lg font-semibold text-gray-900 mb-0.5 group-hover:text-orange-600 transition-colors duration-300 leading-tight truncate">
                  {item.name}
                </h3>
              </div>

              {/* Mobile Touch Indicator */}
              <div className="w-8 h-1 bg-orange-400 rounded-full mt-2 opacity-0 sm:hidden group-active:opacity-100 transition-opacity duration-200"></div>
            </div>
          ))}
        </div>

        {/* Mobile Scroll Hint */}
        <div className="flex justify-center mt-4 sm:hidden">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>←</span>
            <span>Swipe to explore</span>
            <span>→</span>
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
      `}</style>
    </section>
  );
};

export default ShopByStore;
