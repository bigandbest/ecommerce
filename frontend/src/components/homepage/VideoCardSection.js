"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getActiveVideoCards } from "@/api/videoCardApi";
import {
  getBannersByType,
  getAllBanners,
  getAllAdminBanners,
} from "@/api/bannerApi";

const VideoCardSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoCards, setVideoCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(30);

  // New state for Mega Sale banner
  const [megaBanner, setMegaBanner] = useState(null);
  const [megaLoading, setMegaLoading] = useState(true);

  // Mock data as fallback
  const mockVideoCards = [
    {
      id: 1,
      title: "Product Showcase",
      description: "Discover our latest products",
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail_url: "/prod1.png",
      active: true,
      position: 1
    }
  ];

  // Helper function to check if URL is a YouTube URL
  const isYouTubeUrl = (url) => {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  };

  // Helper function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&loop=1&playlist=${match[2]}&controls=0&modestbranding=1&rel=0`
      : null;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await getActiveVideoCards();
        console.log("API Response:", response);
        if (response.success && response.videoCards && response.videoCards.length > 0) {
          console.log("Video cards data:", response.videoCards);
          setVideoCards(response.videoCards);
          setCurrentVideo(response.videoCards[0]);
          setCurrentIndex(0);
        } else {
          // Silently use mock data as fallback
          setVideoCards(mockVideoCards);
          setCurrentVideo(mockVideoCards[0]);
          setCurrentIndex(0);
        }
      } catch (error) {
        // Silently use mock data as fallback
        setVideoCards(mockVideoCards);
        setCurrentVideo(mockVideoCards[0]);
        setCurrentIndex(0);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    // fetch mega banner independently
    fetchMegaBanner();
  }, []);

  // New: fetch mega sale banner (search by position name "mega_sale" or "Mega_sale")
  const fetchMegaBanner = async () => {
    try {
      setMegaLoading(true);

      // Try admin banners first
      let result = await getAllAdminBanners();

      // Fallback to old banners table if admin banners not available
      if (!result || !result.success || !result.banners || result.banners.length === 0) {
        result = await getAllBanners();
      }

      if (result && result.success && Array.isArray(result.banners)) {
        // Find banner with position 'mega_sale' (case-insensitive) or position name containing 'mega'
        const found = result.banners.find((b) => {
          const pos = (b.position || b.position_name || "").toString().toLowerCase();
          const name = (b.name || b.title || "").toString().toLowerCase();
          return pos === "mega_sale" || pos === "mega-sale" || pos.includes("mega") || name.includes("mega");
        });

        if (found) {
          const mapped = {
            id: found.id,
            name: found.name || found.title,
            image_url: found.image_url,
            link: found.link || "/products",
            description: found.description,
            bgColor: found.bgColor,
            priority: true,
          };
          setMegaBanner(mapped);
          console.log("Loaded mega sale banner from backend", mapped);
        } else {
          console.log("No mega sale banner found in admin/old banners");
          setMegaBanner(null);
        }
      } else {
        setMegaBanner(null);
      }
    } catch (err) {
      console.warn("Failed to load mega banner, using fallback", err);
      setMegaBanner(null);
    } finally {
      setMegaLoading(false);
    }
  };

  // Function to select a video
  const selectVideo = (video, index) => {
    setCurrentVideo(video);
    setCurrentIndex(index);
  };

  // Function to go to next video
  const nextVideo = () => {
    if (videoCards.length > 0) {
      const nextIndex = (currentIndex + 1) % videoCards.length;
      setCurrentVideo(videoCards[nextIndex]);
      setCurrentIndex(nextIndex);
    }
  };

  // Function to go to previous video
  const prevVideo = () => {
    if (videoCards.length > 0) {
      const prevIndex =
        currentIndex === 0 ? videoCards.length - 1 : currentIndex - 1;
      setCurrentVideo(videoCards[prevIndex]);
      setCurrentIndex(prevIndex);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (videoCards.length <= 1) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevVideo();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextVideo();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [videoCards.length, currentIndex]);
  useEffect(() => {
    if (videoCards.length <= 1) return;

    const interval = setInterval(() => {
      nextVideo();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [videoCards.length, currentIndex]);

  // Reset countdown when video changes manually
  useEffect(() => {
    setAutoPlayCountdown(30);
  }, [currentIndex]);

  // Don't render if loading or no video cards
  if (loading) {
    return (
      <div className="w-full py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD5B00] mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading videos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no video cards available
  if (!videoCards || videoCards.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-6 sm:py-8 md:py-10 lg:py-12">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#2A2A2A] mb-3 sm:mb-4">
            Exclusive <span className="text-[#FD5B00]">Content</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-3 sm:px-4">
            Discover premium products and exclusive deals in our curated
            collection
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 h-auto lg:h-[500px]">
          {/* Left Section - Video */}
          <div className="w-full lg:w-1/2 h-auto lg:h-full">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden h-full shadow-xl">
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-500 font-semibold text-xs sm:text-sm">
                        FEATURED
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                      {currentVideo?.title || "Exclusive Content"}
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
                      {currentVideo?.description ||
                        "Product showcase & reviews"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-xs">
                      {videoCards.length > 1
                        ? `${currentIndex + 1} of ${videoCards.length}`
                        : "Videos"}
                    </div>
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {videoCards.length}
                    </div>
                    {videoCards.length > 1 && (
                      <div className="text-white/40 text-xs mt-1">
                        Next: {autoPlayCountdown}s
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative flex-1 mx-3 sm:mx-4 md:mx-6 mb-3 sm:mb-4 md:mb-6 bg-black rounded-lg border border-gray-700 flex items-center justify-center h-[140px] sm:h-[160px] md:h-[180px] lg:h-[200px] overflow-hidden">
                {currentVideo?.video_url ? (
                  isYouTubeUrl(currentVideo.video_url) ? (
                    // YouTube embed
                    <iframe
                      key={currentVideo.id}
                      className="absolute inset-0 w-full h-full rounded-lg"
                      src={getYouTubeEmbedUrl(currentVideo.video_url)}
                      title={currentVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onLoad={() => console.log("YouTube video loaded")}
                      onError={() =>
                        console.error("YouTube video failed to load")
                      }
                    />
                  ) : (
                    // Direct video file
                    <video
                      key={currentVideo.id} // Force re-render when video changes
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onLoadedData={() => {
                        console.log("Video loaded and playing successfully");
                      }}
                      onError={(e) => {
                        console.error("Video failed to load:", e);
                        console.error("Video URL:", currentVideo.video_url);
                        console.error("Video element error:", e.target.error);
                      }}
                      onCanPlay={() => {
                        console.log("Video can play");
                      }}
                      onCanPlayThrough={() => {
                        console.log("Video can play through");
                      }}
                    >
                      <source src={currentVideo.video_url} type="video/mp4" />
                      <source src={currentVideo.video_url} type="video/webm" />
                      <source src={currentVideo.video_url} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                  )
                ) : currentVideo?.thumbnail_url ? (
                  <img
                    src={currentVideo.thumbnail_url}
                    alt={currentVideo.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400 text-sm">
                      No video available
                    </div>
                  </div>
                )}

                {/* Optional overlay with play button for user interaction */}
                {/* {currentVideo?.video_url && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                      Playing
                    </div>
                  </div>
                )} */}

                {/* <div className="absolute bottom-1.5 sm:bottom-2 md:bottom-3 left-1.5 sm:left-2 md:left-3 flex items-center gap-1.5 sm:gap-2 md:gap-3 text-white/80 text-xs sm:text-sm">
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-xs sm:text-sm">4.8</span>
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="text-xs sm:text-sm">1.2K</span>
                  </div>
                </div> */}

                {/* <div className="absolute top-1.5 sm:top-2 md:top-3 right-1.5 sm:right-2 md:right-3 bg-black/70 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
                  <span className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    LIVE
                  </span>
                </div> */}
              </div>

              {/* Video Selector - Only show if there are multiple videos */}
              {videoCards.length > 1 && (
                <div className="mx-3 sm:mx-4 md:mx-6 mb-3 sm:mb-4 md:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Previous button */}
                    <button
                      onClick={prevVideo}
                      className="flex-shrink-0 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors"
                      aria-label="Previous video"
                    >
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Video thumbnails */}
                    <div className="flex-1 overflow-x-auto scrollbar-hide">
                      <div className="flex gap-2 sm:gap-3">
                        {videoCards.map((video, index) => (
                          <button
                            key={video.id}
                            onClick={() => selectVideo(video, index)}
                            className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                              currentIndex === index
                                ? "border-[#FD5B00] ring-2 ring-[#FD5B00]/50"
                                : "border-gray-600 hover:border-gray-400"
                            }`}
                          >
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            )}
                            {/* Playing indicator */}
                            {currentIndex === index && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="w-3 h-3 bg-[#FD5B00] rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Next button */}
                    <button
                      onClick={nextVideo}
                      className="flex-shrink-0 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full transition-colors"
                      aria-label="Next video"
                    >
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Mega Sale Banner */}
          <div className="w-full lg:w-1/2">
            <div className="relative h-[180px] sm:h-[200px] md:h-[240px] lg:h-full">
              {megaLoading ? (
                <div className="h-full bg-gradient-to-br from-[#FD5B00] to-[#FF6B35] rounded-xl p-4 sm:p-6 md:p-8 text-white shadow-xl overflow-hidden flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : megaBanner ? (
                <div
                  className="h-full rounded-xl overflow-hidden shadow-xl relative cursor-pointer"
                  onClick={() => {
                    if (megaBanner.link) window.location.href = megaBanner.link;
                  }}
                >
                  {megaBanner.image_url ? (
                    <div className="absolute inset-0">
                      <Image
                        src={megaBanner.image_url}
                        alt={megaBanner.name || "Mega Sale"}
                        fill
                        className="object-cover"
                        priority={megaBanner.priority}
                      />
                      <div className="absolute inset-0 bg-black/30"></div>
                    </div>
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${megaBanner.bgColor || "from-[#FD5B00] to-[#FF6B35]"} `}></div>
                  )}

                  <div className="relative z-10 h-full p-4 sm:p-6 md:p-8 text-white flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white font-bold text-sm uppercase tracking-wider">
                          {megaBanner.name || "Limited Time"}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 leading-tight">
                        {megaBanner.name || "MEGA SALE"}
                      </h3>
                      {megaBanner.description && (
                        <p className="text-white/90 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-xs">
                          {megaBanner.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <div className="text-xs text-white/80 mb-1">Ends in</div>
                        <div className="text-lg font-bold text-white">
                          24:00:00
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (megaBanner.link) window.location.href = megaBanner.link;
                        }}
                        className="bg-white text-[#FD5B00] px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base hover:bg-white/90 transition-colors shadow-lg"
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full bg-gradient-to-br from-[#FD5B00] to-[#FF6B35] rounded-xl p-4 sm:p-6 md:p-8 text-white shadow-xl overflow-hidden relative">
                  {/* Fallback static content if no mega banner */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 text-6xl font-bold">%</div>
                    <div className="absolute bottom-4 left-4 text-4xl font-bold">OFF</div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl font-black opacity-5">SALE</div>
                  </div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white font-bold text-sm uppercase tracking-wider">Limited Time</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 leading-tight">MEGA SALE</h3>
                      <p className="text-white/90 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-xs">Up to 70% off on selected items. Don't miss out on these incredible deals!</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                        <div className="text-xs text-white/80 mb-1">Ends in</div>
                        <div className="text-lg font-bold text-white">24:00:00</div>
                      </div>
                      <button className="bg-white text-[#FD5B00] px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base hover:bg-white/90 transition-colors shadow-lg">Shop Now</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardSection;
