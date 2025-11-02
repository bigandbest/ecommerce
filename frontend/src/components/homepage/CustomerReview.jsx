"use client";
import { useState, useEffect, useRef } from "react";
import { IoStarSharp } from "react-icons/io5";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Image from "next/image";

function CustomerReview({ sectionName, sectionDescription }) {
  const [hoveredIndex, setHoveredIndex] = useState(0); // First element hovered by default
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const reviews = [
    {
      name: "Rishabh Rawat",
      ratings: 5,
      img: "",
      comment:
        "Absolutely loved the product! The quality exceeded my expectations and the customer service was prompt and helpful. I've already recommended it to several friends and family members. Will definitely purchase again!",
    },
    {
      name: "Aarav Mehta",
      ratings: 4,
      img: "",
      comment:
        "Overall, I'm quite happy with my experience. The ordering process was smooth and the delivery was faster than expected. However, the packaging could be improved to make the unboxing feel a bit more premium.",
    },
    {
      name: "Sneha Kapoor",
      ratings: 5,
      img: "",
      comment:
        "This was my first purchase from the site, and I'm genuinely impressed. The product looks and feels high quality, and the attention to detail is evident. It arrived well-packed and on time. Highly recommend it!",
    },
    {
      name: "Dev Sharma",
      ratings: 3,
      img: "",
      comment:
        "The product was okay — not bad, but not exceptional either. It serves the purpose, but I felt like it didn't fully live up to the hype based on the description and other reviews. Room for improvement.",
    },
    {
      name: "Isha Verma",
      ratings: 4,
      img: "",
      comment:
        "Really liked the product. The craftsmanship is nice, and it feels durable. The only downside was the delivery which took a few extra days, but the customer support kept me informed, which I appreciated.",
    },
    {
      name: "Nikhil Joshi",
      ratings: 5,
      img: "",
      comment:
        "Excellent value for money. The material feels premium and it functions exactly as described. The website was easy to navigate, and I found what I needed within minutes. Definitely coming back for more!",
    },
    {
      name: "Ananya Singh",
      ratings: 4,
      img: "",
      comment:
        "Very happy with the purchase. It's exactly what I was looking for and matched the description perfectly. If the price drops during a sale, I'll probably buy another one as a gift.",
    },
    {
      name: "Kunal Bansal",
      ratings: 2,
      img: "",
      comment:
        "Disappointed with the product. It didn't match the pictures or the expectations I had based on the description. The material feels cheap and the fit wasn't as expected. Not worth the price in my opinion.",
    },
    {
      name: "Meera Chauhan",
      ratings: 5,
      img: "",
      comment:
        "I'm in love with this product! From the moment I opened the box, I could tell it was crafted with care. It fits seamlessly into my daily routine and even sparked compliments from friends. A must-have!",
    },
  ];

  // Responsive slides calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(3);
      }
      // Reset hover to first element when viewport changes
      setHoveredIndex(0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex(
        (prev) => (prev + 1) % Math.ceil(reviews.length / slidesPerView)
      );
      // Reset hover to first element when auto-scrolling
      setHoveredIndex(0);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, reviews.length, slidesPerView]);

  // Get visible reviews for current slide
  const getVisibleReviews = () => {
    const start = currentIndex * slidesPerView;
    return reviews.slice(start, start + slidesPerView);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.ceil(reviews.length / slidesPerView) - 1 : prev - 1
    );
    // Reset hover to first element when navigating
    setHoveredIndex(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === Math.ceil(reviews.length / slidesPerView) - 1 ? 0 : prev + 1
    );
    // Reset hover to first element when navigating
    setHoveredIndex(0);
  };

  const handleMouseEnter = (index) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // When leaving, set hover back to first element after a short delay
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredIndex(0);
    }, 100);
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="px-3 sm:px-4 md:px-5 xl:px-8 w-full h-auto flex flex-col py-4 sm:py-5 md:py-6 gap-4 sm:gap-6 md:gap-8">
      <div className="w-full h-auto font-outfit flex flex-col gap-2 sm:gap-3 text-center">
        <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl xl:text-5xl bg-gradient-to-r from-[#FD5B00] to-[#FF8A00] bg-clip-text text-transparent">
          {sectionName || "⭐ What Our Happy Customers Say"}
        </h1>
        <p className="text-[#666] text-sm sm:text-base md:text-lg font-medium">
          {sectionDescription ||
            "Real experiences from real people who love shopping with us"}
        </p>
        <div className="flex justify-center items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <IoStarSharp key={i} className="text-[#FFA500]" size={16} />
            ))}
          </div>
          <span className="text-[#2A2A2A] font-semibold text-sm sm:text-base">
            4.8/5
          </span>
          <span className="text-[#666] text-xs sm:text-sm">
            (2,500+ reviews)
          </span>
        </div>
      </div>

      <div
        className="relative w-full py-4 sm:py-6 md:py-8 xl:py-14"
        ref={carouselRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute hidden md:block -left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all"
          aria-label="Previous reviews"
        >
          <FiChevronLeft size={24} className="text-[#FD5B00]" />
        </button>
        <button
          onClick={handleNext}
          className="absolute hidden md:block -right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-all"
          aria-label="Next reviews"
        >
          <FiChevronRight size={24} className="text-[#FD5B00]" />
        </button>

        {/* Reviews Carousel */}
        <div className="w-full lg:h-[320px] pb-4 sm:pb-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {getVisibleReviews().map((item, index) => {
            const globalIndex = currentIndex * slidesPerView + index;

            return (
              <div
                className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-100 relative overflow-hidden"
                key={`${item.name}-${globalIndex}`}
              >
                <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-bl from-[#FD5B00]/10 to-transparent rounded-bl-full"></div>
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4 relative z-10">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#FD5B00]/20 to-[#FF8A00]/20 flex items-center justify-center flex-shrink-0 ring-1 sm:ring-2 ring-[#FD5B00]/20">
                    <Image
                      src={item.img || "/virat.png"}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-[#2A2A2A] flex items-center gap-1">
                          {item.name}
                          <span className="text-[#FD5B00] text-xs">✓</span>
                        </h3>
                        <p className="text-[10px] sm:text-xs text-[#666] font-medium">
                          Verified Customer
                        </p>
                      </div>
                      <div className="flex gap-0.5 sm:gap-1 bg-gradient-to-r from-[#FFA500]/10 to-[#FF8A00]/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        {Array.from({ length: 5 }, (_, i) => (
                          <IoStarSharp
                            key={i}
                            className={
                              i < item.ratings
                                ? "text-[#FFA500]"
                                : "text-gray-300"
                            }
                            size={10}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-1 sm:-left-2 -top-0.5 sm:-top-1 text-[#FD5B00]/30 text-lg sm:text-2xl font-bold">
                    "
                  </div>
                  <p className="text-[#555] text-xs sm:text-sm leading-relaxed font-medium pl-3 sm:pl-4 italic">
                    {item.comment.length > 85
                      ? `${item.comment.substring(0, 85)}...`
                      : item.comment}
                  </p>
                  <div className="absolute -right-0.5 sm:-right-1 -bottom-0.5 sm:-bottom-1 text-[#FD5B00]/30 text-lg sm:text-2xl font-bold">
                    "
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dots Indicator */}
        <div className="hidden sm:flex justify-center mt-6 sm:mt-8 space-x-2">
          {Array.from({
            length: Math.ceil(reviews.length / slidesPerView),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-blue-500" : "bg-gray-300"
              }`}
              aria-label={`Go to review set ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CustomerReview;
