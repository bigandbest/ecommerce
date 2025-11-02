"use client";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";

const BrandVista = () => {
  const scrollRef = useRef(null);
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brand/list`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Map backend brands to frontend expected structure
          const mappedBrands = data.brands.map((brand) => ({
            id: brand.id,
            name: brand.name,
            price: "Explore Now",
            originalPrice: "",
            image: brand.image_url || "/comp1.svg",
            discount: "",
          }));
          setBrands(mappedBrands);
        } else {
          setError(
            "Failed to fetch brands: " + (data.error || "Unknown error")
          );
        }
      } else {
        setError(
          `Failed to fetch brands: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setError("Error fetching brands: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const leftCategories = [
    {
      id: 1,
      name: "Audio Gear & Watches",
      discount: "UP TO 90% OFF",
      image: "/comp1.svg",
      originalPrice: "₹2,999",
      salePrice: "₹299",
    },
    {
      id: 2,
      name: "Home & Kitchen Appliances",
      discount: "UP TO 80% OFF",
      image: "/comp2.svg",
      originalPrice: "₹4,999",
      salePrice: "₹999",
    },
    {
      id: 3,
      name: "Tech Accessories",
      discount: "UP TO 75% OFF",
      image: "/comp3.svg",
      originalPrice: "₹1,999",
      salePrice: "₹499",
    },
    {
      id: 4,
      name: "Charging Needs",
      discount: "UP TO 80% OFF",
      image: "/comp4.svg",
      originalPrice: "₹1,499",
      salePrice: "₹299",
    },
    {
      id: 5,
      name: "Personal Care & Grooming",
      discount: "UP TO 80% OFF",
      image: "/comp5.svg",
      originalPrice: "₹3,999",
      salePrice: "₹799",
    },
  ];

  const rightCategories = [
    {
      id: 1,
      name: "Luscious Lips",
      discount: "UP TO 40% OFF",
      image: "/comp1.svg",
      originalPrice: "₹1,299",
      salePrice: "₹779",
    },
    {
      id: 2,
      name: "Flawless Face",
      discount: "UP TO 45% OFF",
      image: "/comp2.svg",
      originalPrice: "₹2,499",
      salePrice: "₹1,374",
    },
    {
      id: 3,
      name: "Dazzling Eyes",
      discount: "UP TO 60% OFF",
      image: "/comp3.svg",
      originalPrice: "₹1,999",
      salePrice: "₹799",
    },
    {
      id: 4,
      name: "Nails & more",
      discount: "UP TO 50% OFF",
      image: "/comp4.svg",
      originalPrice: "₹899",
      salePrice: "₹449",
    },
    {
      id: 5,
      name: "Korean Beauty",
      discount: "UP TO 60% OFF",
      image: "/comp5.svg",
      originalPrice: "₹3,999",
      salePrice: "₹1,599",
    },
  ];

  const scroll = (direction, ref) => {
    const container = ref.current;
    const scrollAmount = 200;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      {/* Brand Vista Section */}
      <div className="w-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl py-6 pb-8 relative mb-6 shadow-2xl overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-yellow-300/30 to-orange-300/30" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between px-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full mb-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-white text-xs font-medium">
                  Featured Brands
                </span>
              </div>
              <h2 className="text-white text-2xl sm:text-3xl font-black mb-1">
                Brand Vista
              </h2>
              <p className="text-white/90 text-sm">
                Exclusive deals from top brands
              </p>
            </div>
          </div>
          {/* Desktop: Single Row with Marquee */}
          <div className="hidden sm:block overflow-hidden px-6">
            {error ? (
              <div className="text-center py-8">
                <p className="text-white/80 text-sm">{error}</p>
              </div>
            ) : (
              <div className="flex gap-3 sm:gap-4 animate-marquee">
                {loading
                  ? Array.from({ length: 10 }).map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="flex-shrink-0 w-40 lg:w-44 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-4"
                      >
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 h-14 lg:h-16 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="text-center">
                            <div className="h-3 bg-gray-200 rounded mb-1 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  : brands.concat(brands).map((brand, index) => (
                      <div
                        key={`${brand.id}-${index}`}
                        className="flex-shrink-0 w-40 lg:w-44 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl p-4 transition-all duration-300 cursor-pointer group"
                      >
                        {/* Product Image */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-3 transition-colors duration-300">
                          <Image
                            src={brand.image}
                            alt={brand.name}
                            width={100}
                            height={100}
                            className="w-full h-14 lg:h-16 object-contain"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="space-y-2">
                          <div className="text-center">
                            <p className="text-xs font-medium text-gray-500 mb-1">
                              BigBestMart
                            </p>
                            <h3 className="font-semibold text-sm text-gray-800 leading-tight line-clamp-2 mb-2">
                              {brand.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
            )}
          </div>{" "}
          {/* Mobile: Two Rows with Marquee */}
          <div className="sm:hidden px-6 space-y-3 overflow-hidden">
            {error ? (
              <div className="text-center py-8">
                <p className="text-white/80 text-sm">{error}</p>
              </div>
            ) : (
              <>
                {/* First Row */}
                <div className="flex gap-2 animate-marquee">
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={`skeleton-row1-${index}`}
                          className="flex-shrink-0 w-24 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg p-2"
                        >
                          <div className="bg-gray-50 rounded-md p-1.5 mb-2 h-8 animate-pulse"></div>
                          <div className="text-center">
                            <div className="h-2 bg-gray-200 rounded mb-0.5 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))
                    : brands
                        .slice(0, Math.ceil(brands.length / 2))
                        .concat(brands.slice(0, Math.ceil(brands.length / 2)))
                        .map((brand, index) => (
                          <div
                            key={`mobile-row1-${brand.id}-${index}`}
                            className="flex-shrink-0 w-24 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg p-2 transition-all duration-300 cursor-pointer"
                          >
                            {/* Product Image */}
                            <div className="bg-gray-50 rounded-md p-1.5 mb-2 transition-colors duration-300">
                              <Image
                                src={brand.image}
                                alt={brand.name}
                                width={60}
                                height={60}
                                className="w-full h-8 object-contain"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="text-center">
                              <p className="text-[9px] font-medium text-gray-500 mb-0.5">
                                BigBestMart
                              </p>
                              <h3 className="font-semibold text-[10px] text-gray-800 leading-tight line-clamp-2">
                                {brand.name}
                              </h3>
                            </div>
                          </div>
                        ))}
                </div>

                {/* Second Row */}
                <div className="flex gap-2 animate-marquee">
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={`skeleton-row2-${index}`}
                          className="flex-shrink-0 w-24 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg p-2"
                        >
                          <div className="bg-gray-50 rounded-md p-1.5 mb-2 h-8 animate-pulse"></div>
                          <div className="text-center">
                            <div className="h-2 bg-gray-200 rounded mb-0.5 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      ))
                    : brands
                        .slice(Math.ceil(brands.length / 2))
                        .concat(brands.slice(Math.ceil(brands.length / 2)))
                        .map((brand, index) => (
                          <div
                            key={`mobile-row2-${brand.id}-${index}`}
                            className="flex-shrink-0 w-24 bg-white/90 backdrop-blur-sm border border-white/20 rounded-lg p-2 transition-all duration-300 cursor-pointer"
                          >
                            {/* Product Image */}
                            <div className="bg-gray-50 rounded-md p-1.5 mb-2 transition-colors duration-300">
                              <Image
                                src={brand.image}
                                alt={brand.name}
                                width={60}
                                height={60}
                                className="w-full h-8 object-contain"
                              />
                            </div>

                            {/* Product Info */}
                            <div className="text-center">
                              <p className="text-[9px] font-medium text-gray-500 mb-0.5">
                                BigBestMart
                              </p>
                              <h3 className="font-semibold text-[10px] text-gray-800 leading-tight line-clamp-2">
                                {brand.name}
                              </h3>
                            </div>
                          </div>
                        ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dual Deals Section */}
      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[420px]">
        {/* Left Section - Deal Zone */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
          </div>

          {/* Header Section */}
          <div className="relative z-10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full mb-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-blue-200 text-xs font-medium">
                    Electronics
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  Deal Zone
                </h2>
                <h3 className="text-lg sm:text-xl text-blue-300 font-semibold mb-2">
                  MEGA DEALS
                </h3>
                <p className="text-orange-400 text-sm font-bold">
                  UP TO 90% OFF
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left", leftScrollRef)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <span className="text-white text-lg">‹</span>
                </button>
                <button
                  onClick={() => scroll("right", leftScrollRef)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <span className="text-white text-lg">›</span>
                </button>
              </div>
            </div>
          </div>

          {/* Marquee Container for Left Categories */}
          <div className="overflow-hidden" ref={leftScrollRef}>
            <div className="flex gap-3 sm:gap-4">
              {leftCategories.map((category, index) => (
                <div
                  key={`${category.id}-${index}`}
                  className="flex-shrink-0 w-36 sm:w-40 lg:w-44 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-pointer group"
                >
                  {/* Product Image */}
                  <div className="bg-white/10 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 transition-colors duration-300">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={100}
                      height={100}
                      className="w-full h-12 sm:h-14 lg:h-16 object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <h4 className="text-white text-xs sm:text-sm font-semibold leading-tight line-clamp-2">
                      {category.name}
                    </h4>

                    {/* Price Section */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-green-400 text-xs sm:text-sm font-bold">
                          {category.salePrice}
                        </span>
                        <span className="text-gray-400 text-xs line-through">
                          {category.originalPrice}
                        </span>
                      </div>
                      <div className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-500/20 border border-orange-400/30 rounded-md">
                        <span className="text-orange-300 text-xs font-bold">
                          {category.discount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - New Arrival Fest */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-br from-pink-300/30 to-rose-300/30" />
          </div>

          {/* Header Section */}
          <div className="relative z-10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500/20 backdrop-blur-md border border-pink-400/30 rounded-full mb-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                  <span className="text-pink-700 text-xs font-medium">
                    Beauty
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-pink-800 mb-1">
                  New Arrival
                </h2>
                <h3 className="text-lg sm:text-xl text-rose-600 font-semibold mb-2">
                  BEAUTY FEST
                </h3>
                <p className="text-red-600 text-sm font-bold">UP TO 60% OFF</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll("left", rightScrollRef)}
                  className="w-8 h-8 bg-pink-500/20 hover:bg-pink-500/30 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <span className="text-pink-800 text-lg">‹</span>
                </button>
                <button
                  onClick={() => scroll("right", rightScrollRef)}
                  className="w-8 h-8 bg-pink-500/20 hover:bg-pink-500/30 rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <span className="text-pink-800 text-lg">›</span>
                </button>
              </div>
            </div>
          </div>

          {/* Marquee Container for Right Categories */}
          <div className="overflow-hidden" ref={rightScrollRef}>
            <div className="flex gap-3 sm:gap-4">
              {rightCategories.map((category, index) => (
                <div
                  key={`${category.id}-${index}`}
                  className="flex-shrink-0 w-36 sm:w-40 lg:w-44 bg-white/60 backdrop-blur-sm border border-pink-200/50 rounded-xl p-3 sm:p-4 transition-all duration-300 cursor-pointer group"
                >
                  {/* Product Image */}
                  <div className="bg-pink-100/70 rounded-lg p-2 sm:p-3 mb-2 sm:mb-3 transition-colors duration-300">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={100}
                      height={100}
                      className="w-full h-12 sm:h-14 lg:h-16 object-contain"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <h4 className="text-gray-800 text-xs sm:text-sm font-semibold leading-tight line-clamp-2">
                      {category.name}
                    </h4>

                    {/* Price Section */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-green-600 text-xs sm:text-sm font-bold">
                          {category.salePrice}
                        </span>
                        <span className="text-gray-500 text-xs line-through">
                          {category.originalPrice}
                        </span>
                      </div>
                      <div className="inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500/20 border border-red-400/30 rounded-md">
                        <span className="text-red-600 text-xs font-bold">
                          {category.discount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for marquee animation */}
      <style jsx>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
};

export default BrandVista;
