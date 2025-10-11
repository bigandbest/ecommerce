import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBanners } from '../../utils/supabaseApi';
import { useLocationContext } from "../../contexts/LocationContext.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { MapPin, Search, Mic, ChevronDown } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./MobileIntegratedBanner.css";

const MobileIntegratedBanner = () => {
  const [banners, setBanners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSlideColor, setCurrentSlideColor] = useState('#667eea');
  const { selectedAddress, setShowModal, setModalMode } = useLocationContext();
  const navigate = useNavigate();

  const extractDominantColor = (imageUrl) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 50;
          canvas.height = 50;
          ctx.drawImage(img, 0, 0, 50, 50);
          
          const imageData = ctx.getImageData(0, 0, 50, 50);
          const data = imageData.data;
          
          // Color frequency map
          const colorMap = new Map();
          
          for (let i = 0; i < data.length; i += 4) {
            const r = Math.floor(data[i] / 32) * 32;
            const g = Math.floor(data[i + 1] / 32) * 32;
            const b = Math.floor(data[i + 2] / 32) * 32;
            const alpha = data[i + 3];
            
            // Skip transparent pixels
            if (alpha < 128) continue;
            
            const colorKey = `${r},${g},${b}`;
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
          }
          
          // Find most frequent color
          let dominantColor = '#667eea';
          let maxCount = 0;
          
          for (const [color, count] of colorMap) {
            if (count > maxCount) {
              maxCount = count;
              const [r, g, b] = color.split(',').map(Number);
              
              // Enhance saturation and brightness
              const enhancedR = Math.min(255, Math.max(50, r + 30));
              const enhancedG = Math.min(255, Math.max(50, g + 30));
              const enhancedB = Math.min(255, Math.max(50, b + 30));
              
              dominantColor = `rgb(${enhancedR}, ${enhancedG}, ${enhancedB})`;
            }
          }
          
          setCurrentSlideColor(dominantColor);
        } catch (error) {
          console.log('Color extraction failed, using fallback');
          setCurrentSlideColor('#667eea');
        }
      };
      img.onerror = () => {
        setCurrentSlideColor('#667eea');
      };
      img.src = imageUrl;
    } catch (error) {
      setCurrentSlideColor('#667eea');
    }
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const result = await getAllBanners();
        if (result.success && Array.isArray(result.banners)) {
          const heroBanners = result.banners.filter(b => b.active && b.position === 'hero');
          setBanners(heroBanners.map(b => ({
            id: b.id,
            title: b.title,
            description: b.description,
            imageUrl: b.image || b.image_url,
            link: b.link || '#',
          })));
        }
      } catch (error) {
        console.error('Failed to load banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productListing?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleLocationClick = () => {
    setShowModal(true);
    setModalMode("visibility");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80 bg-gradient-to-br from-orange-400 to-orange-600">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full min-h-[320px] overflow-hidden transition-all duration-1000 ease-out"
      style={{
        background: `linear-gradient(135deg, ${currentSlideColor} 0%, ${currentSlideColor}e6 30%, ${currentSlideColor}cc 70%, ${currentSlideColor}99 100%)`,
      }}
    >
      {/* Location Bar */}
      <div 
        className="relative z-20 px-4 py-3 backdrop-blur-lg transition-all duration-500"
        style={{
          background: `linear-gradient(135deg, ${currentSlideColor}40 0%, ${currentSlideColor}20 100%)`,
          borderBottom: `1px solid ${currentSlideColor}60`
        }}
      >
        <button 
          onClick={handleLocationClick} 
          className="flex items-center gap-2 w-full p-3 rounded-xl text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm"
          style={{
            background: `linear-gradient(135deg, ${currentSlideColor}30 0%, ${currentSlideColor}15 100%)`,
            border: `1px solid ${currentSlideColor}50`
          }}
        >
          <MapPin size={20} className="flex-shrink-0 bg-white/20 p-2 rounded-full" />
          <div className="flex flex-col items-start flex-1 text-left">
            <span className="text-sm font-bold leading-none mb-1">Home</span>
            <span className="text-xs opacity-90 leading-none max-w-[250px] truncate">
              {selectedAddress 
                ? `${selectedAddress.city}, ${selectedAddress.state}${selectedAddress.postal_code ? ` - ${selectedAddress.postal_code}` : ''}` 
                : "37/1, Central Road Uttarpara..."
              }
            </span>
          </div>
          <ChevronDown size={20} className="flex-shrink-0 opacity-80 bg-white/15 p-1.5 rounded-full transition-transform duration-300 hover:rotate-180" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative z-20 px-4 pb-4">
        <form onSubmit={handleSearch} className="w-full">
          <div 
            className="relative flex items-center bg-white/95 rounded-2xl px-5 py-3 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 backdrop-blur-sm"
            style={{
              boxShadow: `0 8px 25px ${currentSlideColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.9)`,
              border: `1px solid ${currentSlideColor}20`,
            }}
          >
            <Search size={20} className="text-indigo-600 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Electronics, Grocery..."
              className="flex-1 border-none outline-none text-base text-gray-800 bg-transparent placeholder-gray-500"
            />
            <Mic size={20} className="text-indigo-600 ml-3 flex-shrink-0 cursor-pointer p-1 rounded-full hover:bg-indigo-100 transition-all" />
          </div>
        </form>
      </div>

      {/* Banner Carousel */}
      <div className="relative w-full h-56 z-10 flex items-end mt-4">
        {banners.length > 0 ? (
          <Swiper
            navigation={false}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            loop={true}
            modules={[Navigation, Pagination, Autoplay]}
            className="w-full h-full [&_.swiper-pagination]:bottom-2 [&_.swiper-pagination-bullet]:bg-white/50 [&_.swiper-pagination-bullet]:opacity-100 [&_.swiper-pagination-bullet]:w-2 [&_.swiper-pagination-bullet]:h-2 [&_.swiper-pagination-bullet-active]:bg-white"
            onSlideChange={(swiper) => {
              const activeSlide = banners[swiper.realIndex];
              if (activeSlide?.imageUrl) {
                extractDominantColor(activeSlide.imageUrl);
              }
            }}
            onSwiper={(swiper) => {
              if (banners.length > 0) {
                extractDominantColor(banners[0].imageUrl);
              }
            }}
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id} className="flex items-end">
                <a href={banner.link} className="block w-full h-full flex items-end">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover object-bottom"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x200/FF6B35/FFFFFF?text=FLAT+50%25+OFF';
                    }}
                  />
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-end">
            <img
              src="https://placehold.co/400x200/FF6B35/FFFFFF?text=FLAT+50%25+OFF"
              alt="Default Banner"
              className="w-full h-full object-cover object-bottom"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileIntegratedBanner;