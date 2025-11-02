"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  getBannersByType,
  getAllBanners,
  getAllAdminBanners,
} from "@/api/bannerApi";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://big-best-backend.vercel.app/api";

function PromoBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(1);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch banners from API - prefer admin APIs and filter for position/name 'promo'
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);

        let result = null;
        try {
          result = await getBannersByType("promo");
        } catch (e) {
          console.warn("getBannersByType('promo') failed:", e?.message || e);
        }

        if (!result || !result.success || !result.banners || result.banners.length === 0) {
          try {
            result = await getAllAdminBanners();
          } catch (e) {
            console.warn("getAllAdminBanners() failed:", e?.message || e);
          }
        }

        if (!result || !result.success || !result.banners || result.banners.length === 0) {
          try {
            result = await getAllBanners();
          } catch (e) {
            console.warn("getAllBanners() failed:", e?.message || e);
          }
        }

        const isPromoBanner = (b) => {
          const pos = (b.position || b.position_name || "").toString().toLowerCase();
          const bt = (b.banner_type || "").toString().toLowerCase();
          const name = (b.name || b.title || "").toString().toLowerCase();
          return pos.includes("promo") || bt === "promo" || name.includes("promo");
        };

        let promoBanners = [];
        if (result && result.success && Array.isArray(result.banners)) {
          promoBanners = result.banners.filter(isPromoBanner);
        }

        if (promoBanners.length > 0) {
          const formatted = promoBanners.map((banner) => ({
            id: banner.id,
            title: banner.title || banner.name || "Promo",
            image_url: banner.image_url || banner.imageUrl || null,
            subtitle: banner.subtitle || banner.description || "",
            discount: banner.discount || banner.tagline || "",
            description: banner.description || banner.subtitle || "",
            buttonText: banner.button_text || banner.buttonText || "SHOP NOW",
            bgColor: banner.bg_color || banner.bgColor || "from-indigo-600 via-purple-600 to-pink-600",
            accentColor: banner.accent_color || banner.accentColor || "from-pink-400 to-rose-400",
            icon: banner.icon || "💥",
            category: banner.category || "",
            link: banner.link || banner.url || "/products",
          }));

          setSlides(formatted);
        } else {
          // fallback to legacy endpoint
          try {
            const response = await fetch(`${API_BASE_URL}/promo-banner/all`);
            if (response.ok) {
              const data = await response.json();
              if (data.success && Array.isArray(data.banners) && data.banners.length > 0) {
                const formattedBanners = data.banners.map((banner) => ({
                  id: banner.id,
                  title: banner.title || banner.name || "Promo",
                  image_url: banner.image_url || banner.imageUrl || null,
                  subtitle: banner.subtitle || banner.description || "",
                  discount: banner.discount || banner.tagline || "",
                  description: banner.description || banner.subtitle || "",
                  buttonText: banner.button_text || banner.buttonText || "SHOP NOW",
                  bgColor: banner.bg_color || banner.bgColor || "from-indigo-600 via-purple-600 to-pink-600",
                  accentColor: banner.accent_color || banner.accentColor || "from-pink-400 to-rose-400",
                  icon: banner.icon || "💥",
                  category: banner.category || "",
                  link: banner.link || banner.url || "/products",
                }));
                setSlides(formattedBanners);
              } else {
                setSlides([
                  {
                    id: 1,
                    title: "MEGA SALE",
                    subtitle: "FLASH DEAL",
                    discount: "60% OFF",
                    description: "FITNESS GEAR",
                    buttonText: "SHOP NOW",
                    bgColor: "from-indigo-600 via-purple-600 to-pink-600",
                    accentColor: "from-pink-400 to-rose-400",
                    icon: "💪",
                    category: "Fitness",
                  },
                ]);
              }
            } else {
              setSlides([
                {
                  id: 1,
                  title: "MEGA SALE",
                  subtitle: "FLASH DEAL",
                  discount: "60% OFF",
                  description: "FITNESS GEAR",
                  buttonText: "SHOP NOW",
                  bgColor: "from-indigo-600 via-purple-600 to-pink-600",
                  accentColor: "from-pink-400 to-rose-400",
                  icon: "💪",
                  category: "Fitness",
                },
              ]);
            }
          } catch (err) {
            console.error("Error fetching legacy promo endpoint:", err);
            setSlides([
              {
                id: 1,
                title: "MEGA SALE",
                subtitle: "FLASH DEAL",
                discount: "60% OFF",
                description: "FITNESS GEAR",
                buttonText: "SHOP NOW",
                bgColor: "from-indigo-600 via-purple-600 to-pink-600",
                accentColor: "from-pink-400 to-rose-400",
                icon: "💪",
                category: "Fitness",
              },
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching promo banners:", error);
        setSlides([
          {
            id: 1,
            title: "MEGA SALE",
            subtitle: "FLASH DEAL",
            discount: "60% OFF",
            description: "FITNESS GEAR",
            buttonText: "SHOP NOW",
            bgColor: "from-indigo-600 via-purple-600 to-pink-600",
            accentColor: "from-pink-400 to-rose-400",
            icon: "💪",
            category: "Fitness",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const nextSlide = useCallback(() => {
    if (slides.length > 0) {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length > 0) {
      setDirection(-1);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  }, [slides.length]);

  const goToSlide = useCallback(
    (index) => {
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
    },
    [currentSlide]
  );

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isAutoPlaying, slides.length]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
        <div className="w-full h-[280px] sm:h-[320px] lg:h-[360px] rounded-2xl bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-500">Loading banners...</span>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
      <div
        className="relative w-full h-[280px] sm:h-[320px] lg:h-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            {/* Background: use backend image if provided, otherwise gradient */}
            {slide.image_url ? (
              <div className="w-full h-full relative">
                <div className="absolute inset-0">
                  <Image
                    src={slide.image_url}
                    alt={slide.title || "Promo"}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  {/* subtle dark overlay to ensure text contrast */}
                  <div className="absolute inset-0 bg-black/35" />
                </div>

                {/* Optional mesh overlay + glass layer for consistency */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `
                      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.06) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.06) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)
                    `,
                    animation: "float 8s ease-in-out infinite",
                  }}
                />
                <div className="absolute inset-0 bg-white/3 backdrop-blur-[1px]" />

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white/20 rounded-full animate-bounce"
                      style={{
                        left: `${30 + i * 25}%`,
                        top: `${40 + (i % 2) * 20}%`,
                        animationDelay: `${i * 1.5}s`,
                        animationDuration: `${3 + i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${slide.bgColor} relative`}
              >
                {/* Animated Mesh Gradient Overlay */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `
                      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
                    `,
                    animation: "float 8s ease-in-out infinite",
                  }}
                />

                {/* Glassmorphism Layer */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" />

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white/20 rounded-full animate-bounce"
                      style={{
                        left: `${30 + i * 25}%`,
                        top: `${40 + (i % 2) * 20}%`,
                        animationDelay: `${i * 1.5}s`,
                        animationDuration: `${3 + i * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Content Container */}
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left space-y-3">
                {/* Category Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-medium">
                    {slides[currentSlide].category} Deal
                  </span>
                </div>

                {/* Title Section */}
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl text-white/90 font-semibold">
                    {slides[currentSlide].subtitle}
                  </p>
                </div>

                {/* Discount Display */}
                <div className="space-y-0.5">
                  <div className="text-white/80 text-xs font-medium tracking-wider">
                    SAVE UP TO
                  </div>
                  <div
                    className={`text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r ${slides[currentSlide].accentColor} bg-clip-text text-transparent`}
                  >
                    {slides[currentSlide].discount}
                  </div>
                  <div className="text-white/90 text-sm lg:text-base font-semibold">
                    on {slides[currentSlide].description}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (slides[currentSlide]?.link) {
                        window.location.href = slides[currentSlide].link;
                      }
                    }}
                    className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold text-sm lg:text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer"
                  >
                    <span className="relative z-10">
                      {slides[currentSlide]?.buttonText || "SHOP NOW"}
                    </span>
                    <span className="relative z-10 text-lg group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              </div>

              {/* Right Visual Element */}
              
            </div>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-20">
          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="hidden sm:flex w-8 h-8 bg-white/15 backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white hover:bg-white/25 transition-all duration-300 hover:scale-110"
            aria-label="Previous slide"
          >
            <span className="text-sm font-bold">←</span>
          </button>

          {/* Slide Indicators */}
          <div className="hidden sm:flex gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125 shadow-lg"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="hidden sm:flex w-8 h-8 bg-white/15 backdrop-blur-md border border-white/20 rounded-full items-center justify-center text-white hover:bg-white/25 transition-all duration-300 hover:scale-110"
            aria-label="Next slide"
          >
            <span className="text-sm font-bold">→</span>
          </button>
        </div>

        {/* Auto-play Status */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              isAutoPlaying ? "bg-green-400 animate-pulse" : "bg-white/40"
            }`}
          />
          <span className="text-white/70 text-xs font-medium hidden sm:inline">
            {isAutoPlaying ? "Auto" : "Paused"}
          </span>
        </div>

        {/* Progress Indicator */}
      </div>

      {/* Mobile Touch Hint */}
      <div className="flex justify-center mt-4 lg:hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">
          <span className="animate-pulse">👈</span>
          <span>Swipe for more offers</span>
          <span className="animate-pulse" style={{ animationDelay: "0.5s" }}>
            👉
          </span>
        </div>
      </div>
    </div>
  );
}

export default PromoBanner;
