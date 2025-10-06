import React, { useEffect, useState } from "react";
import { getshipping, getAllBanners } from '../../utils/supabaseApi';
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "./style.css";

const HomeSlider = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlideColor, setCurrentSlideColor] = useState('#667eea');

  // Fetch hero banners from Supabase
  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        setLoading(true);
        const result = await getAllBanners(); 
        if (result.success && Array.isArray(result.banners)) {
          const heroBanners = result.banners.filter(b => b.active && b.position === 'hero' && !b.is_mobile);
          setBanners(heroBanners.map(b => ({
            id: b.id,
            title: b.title,
            description: b.description,
            imageUrl: b.image || b.image_url,
            link: b.link || '#',
          })));
        } else {
          setBanners([]);
        }
      } catch (error) {
        setError('Failed to load banners');
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroBanners();
  }, []);
  

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
          
          const colorMap = new Map();
          
          for (let i = 0; i < data.length; i += 4) {
            const r = Math.floor(data[i] / 32) * 32;
            const g = Math.floor(data[i + 1] / 32) * 32;
            const b = Math.floor(data[i + 2] / 32) * 32;
            const alpha = data[i + 3];
            
            if (alpha < 128) continue;
            
            const colorKey = `${r},${g},${b}`;
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
          }
          
          let dominantColor = '#667eea';
          let maxCount = 0;
          
          for (const [color, count] of colorMap) {
            if (count > maxCount) {
              maxCount = count;
              const [r, g, b] = color.split(',').map(Number);
              
              const enhancedR = Math.min(255, Math.max(50, r + 20));
              const enhancedG = Math.min(255, Math.max(50, g + 20));
              const enhancedB = Math.min(255, Math.max(50, b + 20));
              
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
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      className="home-slider rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${currentSlideColor}20 0%, ${currentSlideColor}15 50%, ${currentSlideColor}10 100%)`,
        transition: 'background 1s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '8px',
        borderRadius: '20px'
      }}
    >
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="error-container">
          <p>No banners available.</p>
        </div>
      ) : (
        <>
          <Swiper
            navigation={!isMobile}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            spaceBetween={isMobile ? 6 : 0}
            slidesPerView={isMobile ? 1.1 : 1}
            centeredSlides={isMobile}
            autoplay={banners.length > 1 ? {
              delay: 5000,
              disableOnInteraction: false,
            } : false}
            loop={true}
            modules={[Navigation, Pagination, Autoplay]}
            onSlideChange={(swiper) => {
              setCurrentSlide(swiper.realIndex);
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
            className="main-slider"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <a href={banner.link} className="slider-link">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className={`slider-image ${isMobile ? 'mobile-slide-image' : 'border-0 rounded-2xl'} object-contain w-full h-auto max-h-[300px]`}
                    
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/1200x400?text=Banner+Image+Not+Available';
                    }}
                  />
                  {banner.description && (
                    <div className="banner-caption">
                      <h2>{banner.title}</h2>
                      <p>{banner.description}</p>
                      <button className="banner-btn">Shop Now</button>
                    </div>
                  )}
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
          {banners.length > 0 && (
            <div className="slide-count-btn">{currentSlide + 1}/{banners.length}</div>
          )}
        </>
      )}
    </div>
  );
};

export default HomeSlider;
