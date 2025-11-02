"use client";
import React, { useState, useRef } from "react";

const reelsData = [
  {
    id: 1,
    thumbnail: "/prod1.png",
    title: "Fitness Motivation",
    description: "Check out this amazing workout routine",
  },
  {
    id: 2,
    thumbnail: "/prod2.png",
    title: "Protein Shake Recipe",
    description: "Perfect post-workout nutrition",
  },
  {
    id: 3,
    thumbnail: "/prod3.png",
    title: "Gym Equipment Review",
    description: "Latest fitness gear review",
  },
  {
    id: 4,
    thumbnail: "/prod4.png",
    title: "Supplement Guide",
    description: "Best supplements for beginners",
  },
];

const InstagramReels = ({ sectionName, sectionDescription }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playingReel, setPlayingReel] = useState(null);

  const handleReelClick = (reelId) => {
    setPlayingReel(playingReel === reelId ? null : reelId);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(reelsData.length / 4));
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.ceil(reelsData.length / 4)) %
        Math.ceil(reelsData.length / 4)
    );
  };

  return (
    <section className="container-responsive py-12 sm:py-16 md:py-20">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-[#222] mb-4">
          {sectionName || "Our Instagram Reels"}
        </h2>
        <p className="text-[#666] text-lg md:text-xl">
          {sectionDescription || "Check out our latest Instagram content"}
        </p>
      </div>

      {/* Mobile: Horizontal Scroll */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-4 pb-4" style={{ width: "max-content" }}>
          {reelsData.map((reel) => (
            <div
              key={reel.id}
              className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group w-56 flex-shrink-0 hover:scale-105"
              onClick={() => handleReelClick(reel.id)}
            >
              <div className="relative h-72 bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-14 h-14 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    {playingReel === reel.id ? (
                      <div className="w-4 h-4 bg-black rounded-sm"></div>
                    ) : (
                      <div className="w-0 h-0 border-l-[10px] border-l-black border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent ml-1"></div>
                    )}
                  </div>
                </div>
                <div className="absolute top-3 left-3">
                  <div className="w-8 h-8 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔇</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white text-xs font-bold">IG</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-[#222] mb-2 line-clamp-1">
                  {reel.title}
                </h3>
                <p className="text-xs text-[#666] line-clamp-2 leading-relaxed">
                  {reel.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid with Slider */}
      <div className="hidden lg:block relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({ length: Math.ceil(reelsData.length / 4) }).map(
              (_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-4 gap-4">
                    {reelsData
                      .slice(slideIndex * 4, (slideIndex + 1) * 4)
                      .map((reel) => (
                        <div
                          key={reel.id}
                          className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group"
                          onClick={() => handleReelClick(reel.id)}
                        >
                          <div className="relative aspect-[9/16] bg-gray-100">
                            <img
                              src={reel.thumbnail}
                              alt={reel.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                                {playingReel === reel.id ? (
                                  <div className="w-4 h-4 bg-black"></div>
                                ) : (
                                  <div className="w-0 h-0 border-l-[12px] border-l-black border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                                )}
                              </div>
                            </div>
                            <div className="absolute top-3 left-3">
                              <div className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">🔇</span>
                              </div>
                            </div>
                            <div className="absolute top-3 right-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  IG
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-bold text-sm text-[#222] mb-1 line-clamp-1">
                              {reel.title}
                            </h3>
                            <p className="text-xs text-[#666] line-clamp-2">
                              {reel.description}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-300"
        >
          ←
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-300"
        >
          →
        </button>
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: Math.ceil(reelsData.length / 4) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentSlide ? "bg-[#FF6B00]" : "bg-gray-300"
                }`}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default InstagramReels;
