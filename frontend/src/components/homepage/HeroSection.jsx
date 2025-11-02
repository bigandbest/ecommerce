"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  getBannersByType,
  getAllBanners,
  getAllAdminBanners,
} from "@/api/bannerApi";
import { toast } from "react-toastify";

function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default fallback slides if API fails or no banners available
  const defaultSlides = [
    {
      id: 1,
      name: "SPECIAL OFFER",
      image_url: "/hero.jpg",
      banner_type: "hero",
      bgColor: "from-purple-600 to-blue-600",
      priority: true,
      link: "/products",
    },
    {
      id: 2,
      name: "FREE DELIVERY",
      image_url: "/hero.jpg",
      banner_type: "hero",
      bgColor: "from-green-600 to-teal-600",
      link: "/products",
    },
    {
      id: 3,
      name: "BEST DEALS",
      image_url: "/hero.jpg",
      banner_type: "hero",
      bgColor: "from-orange-600 to-red-600",
      link: "/products",
    },
  ];

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to fetch hero banners specifically from admin panel
        let result = await getBannersByType("hero");

        // If no hero banners, try to get all admin banners
        if (!result.success || !result.banners || result.banners.length === 0) {
          console.log("No hero banners found, fetching all admin banners...");
          result = await getAllAdminBanners();
        }

        // If still no banners, fall back to the old banners table
        if (!result.success || !result.banners || result.banners.length === 0) {
          console.log("No admin banners found, trying old banners table...");
          result = await getAllBanners();
        }

        if (result.success && result.banners && result.banners.length > 0) {
          // Map backend banners to component format
          const mappedBanners = result.banners.map((banner, index) => ({
            id: banner.id,
            name: banner.name || banner.title || `Banner ${index + 1}`,
            image_url: banner.image_url,
            banner_type: banner.banner_type || "hero",
            link: banner.link || "/products",
            description: banner.description,
            active: banner.active !== false, // Default to true if not specified
            position: banner.position,
            is_mobile: banner.is_mobile,
            priority: index === 0, // First banner gets priority loading
          }));

          setBanners(mappedBanners);
          console.log(
            `Loaded ${mappedBanners.length} banners from admin panel`
          );
        } else {
          console.log("No banners found, using default slides");
          setBanners(defaultSlides);
        }
      } catch (error) {
        // Silently handle API errors - use default slides without showing error toast
        if (process.env.NODE_ENV === "development") {
          console.warn("Banner API unavailable, using default slides");
        }
        setError(null); // Don't show error state to users
        setBanners(defaultSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Use banners from backend or fallback to default slides
  const slides = banners.length > 0 ? banners : defaultSlides;

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  // Handle banner click
  const handleBannerClick = (banner) => {
    if (banner.link) {
      window.location.href = banner.link;
    }
  };

  return (
    <div className="w-full h-auto">
      {loading ? (
        <div className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[450px] xl:h-[500px] overflow-hidden bg-gradient-to-r from-gray-300 to-gray-400 flex items-center justify-center">
          <div className="text-white text-lg sm:text-xl">
            Loading banners...
          </div>
        </div>
      ) : error ? (
        <div className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[450px] xl:h-[500px] overflow-hidden bg-gradient-to-r from-red-300 to-red-400 flex items-center justify-center">
          <div className="text-white text-lg sm:text-xl">
            Error loading banners
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[450px] xl:h-[500px] overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              {slide.image_url ? (
                // If banner has image, display it
                <div
                  className="w-full h-full relative cursor-pointer"
                  onClick={() => handleBannerClick(slide)}
                >
                  <Image
                    src={slide.image_url}
                    alt={slide.name || "Banner"}
                    fill
                    sizes="(max-width: 768px) 100vw, 100vw"
                    className="object-cover"
                    priority={slide.priority || index === 0}
                  />
                  {/* Overlay with banner name and description */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center px-4">
                    <div className="text-center text-white max-w-4xl mx-auto">
                      <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-6 leading-tight drop-shadow-lg">
                        {slide.name}
                      </h2>
                      {slide.description && (
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-8 max-w-xs sm:max-w-md md:max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                          {slide.description}
                        </p>
                      )}
                      <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-orange-500">
                        SHOP NOW
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Fallback gradient design
                <div
                  className={`w-full h-full bg-gradient-to-r ${
                    slide.bgColor || "from-gray-600 to-gray-800"
                  } flex items-center justify-center cursor-pointer px-4`}
                  onClick={() => handleBannerClick(slide)}
                >
                  <div className="text-center text-white max-w-4xl mx-auto">
                    <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-6 leading-tight drop-shadow-lg">
                      {slide.name}
                    </h2>
                    {slide.description && (
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-8 max-w-xs sm:max-w-md md:max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        {slide.description}
                      </p>
                    )}
                    <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white/30">
                      SHOP NOW
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Slide Indicators - Hidden on mobile */}
          <div className="hidden sm:flex absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white scale-125"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default HeroSection;
