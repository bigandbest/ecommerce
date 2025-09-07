import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocation } from "react-router-dom";
import { getAllBanners } from "../../utils/supabaseApi.js";

const MobileBannerCarousel = () => {
  const { pathname } = useLocation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // Fetch banners on mount
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const result = await getAllBanners();
        if (result.success && Array.isArray(result.banners)) {
          const heroBanners = result.banners.filter(
            (b) => b.active && b.position === "hero" && b.is_mobile
          );
          setBanners(
            heroBanners.map((b) => ({
              id: b.id,
              title: b.title,
              description: b.description,
              imageUrl: b.image || b.image_url,
              link: b.link || "#",
            }))
          );
        } else {
          setBanners([]);
        }
      } catch (error) {
        setError("Failed to load banners");
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (pathname !== "/") return null;

  return (
    <div className="block md:hidden mt-2 mx-1">
      <div className="overflow-hidden rounded-xl shadow-lg" ref={emblaRef}>
        <div className="flex">
          {loading ? (
            // ✅ Skeleton Loader for LCP
            <div className="min-w-0 flex-[0_0_100%]">
              <div className="w-full h-[150px] bg-gray-200 animate-pulse rounded-xl" />
            </div>
          ) : error || banners.length === 0 ? (
            // ✅ Fallback if no banners
            <div className="min-w-0 flex-[0_0_100%]">
              <img
                src="https://placehold.co/600x200?text=No+Image"
                alt="No Banner"
                className="w-full h-[150px] object-cover rounded-xl"
              />
            </div>
          ) : (
            banners.map((banner, index) => (
              <a
                key={banner.id || index}
                href={banner.link}
                className="min-w-0 flex-[0_0_100%]"
              >
                <img
                  src={banner.imageUrl}
                  srcSet={`${banner.imageUrl}?w=400 400w, ${banner.imageUrl}?w=800 800w`}
                  sizes="(max-width: 768px) 100vw, 768px"
                  alt={banner.title || `Slide ${index + 1}`}
                  className="w-full h-[150px] object-cover object-center rounded-xl"
                  // ✅ First banner: eager + high priority
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchpriority={index === 0 ? "high" : "auto"}
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/600x200?text=No+Image";
                  }}
                />
              </a>
            ))
          )}
        </div>
      </div>

      {/* Pagination Dots (optional, disabled for performance) */}
      {/* <div className="flex justify-center mt-2 space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              selectedIndex === index ? "bg-black" : "bg-gray-400"
            }`}
            onClick={() => emblaApi && emblaApi.scrollTo(index)}
          />
        ))}
      </div> */}
    </div>
  );
};

export default MobileBannerCarousel;
