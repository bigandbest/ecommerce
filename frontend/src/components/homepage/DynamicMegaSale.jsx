"use client";
import { useState, useEffect } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://big-best-backend.vercel.app/api";

const DynamicMegaSale = ({ sectionName }) => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMegaSaleBanners = async () => {
      try {
        console.log(
          "🔄 Fetching mega sale banners from:",
          `${API_BASE_URL}/banner/type/mega_sale`
        );
        const response = await fetch(`${API_BASE_URL}/banner/type/mega_sale`);

        console.log("📡 Response status:", response.status);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        console.log("📊 API Response:", data);

        if (data.success && data.banners && data.banners.length > 0) {
          const activeBanners = data.banners.filter((banner) => banner.active);
          console.log("✅ Active banners found:", activeBanners.length);
          setBanners(activeBanners);
        } else {
          console.log("⚠️ No banners found or API returned empty");
        }
      } catch (error) {
        console.error("❌ Error fetching mega sale banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMegaSaleBanners();
  }, []);

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
        <div className="w-full h-[280px] sm:h-[320px] lg:h-[360px] rounded-2xl bg-gray-200 animate-pulse flex items-center justify-center">
          <span className="text-gray-500">Loading banner...</span>
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    // Show fallback banner for testing
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
        <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[360px] overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-2xl border border-gray-100">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-3xl font-black mb-2">
                {sectionName || "MEGA SALE"}
              </h1>
              <p className="text-lg mb-4">
                No banners found - Add mega_sale banner in admin
              </p>
              <div className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                70% OFF
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show first active banner
  const banner = banners[0];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
      <div className="relative w-full h-[280px] sm:h-[320px] lg:h-[360px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100">
        {/* Background Image or Gradient */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500"
          style={{
            backgroundImage: banner.image_url
              ? `url(${banner.image_url})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left space-y-3">
                {/* Limited Time Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-medium">
                    LIMITED TIME
                  </span>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                    {banner.name || "MEGA SALE"}
                  </h1>
                  {banner.description && (
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 font-semibold">
                      {banner.description}
                    </p>
                  )}
                </div>

                {/* Default content if no description */}
                {!banner.description && (
                  <div className="space-y-0.5">
                    <div className="text-white/80 text-xs font-medium tracking-wider">
                      UP TO
                    </div>
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      70% OFF
                    </div>
                    <div className="text-white/90 text-sm lg:text-base font-semibold">
                      on selected items. Don't miss out on these incredible
                      deals!
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (banner.link) {
                        window.location.href = banner.link;
                      }
                    }}
                    className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold text-sm lg:text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer"
                  >
                    <span className="relative z-10">Shop Now</span>
                    <span className="relative z-10 text-lg group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              </div>

              {/* Right Visual Element */}
              <div className="hidden lg:flex justify-center items-center">
                <div className="relative">
                  {/* Timer */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                    <div className="text-white/80 text-sm font-medium mb-2">
                      Ends in
                    </div>
                    <div className="text-white text-3xl font-black">
                      24:00:00
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicMegaSale;
