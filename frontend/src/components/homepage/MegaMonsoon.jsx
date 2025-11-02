"use client";
import Image from "next/image";
import { useRef } from "react";

const MegaMonsoon = ({ sectionName }) => {
  const scrollParent = useRef(null);

  const products = Array.from({ length: 9 }).map((_, i) => {
    const discountPrice = (i + 1) * 99;
    const originalPrice = (i + 1) * 149;
    const discount = Math.round(
      ((originalPrice - discountPrice) / originalPrice) * 100
    );

    const variants = [
      "Chocolate Flavor",
      "Vanilla Flavor",
      "Strawberry",
      "Mango",
      "Mixed Berry",
      "Protein Plus",
      "Energy Boost",
      "Recovery",
      "Premium",
    ];
    const weights = [
      "1 kg",
      "500g",
      "2 x 1kg",
      "1 Variant",
      "750g",
      "1.5 kg",
      "2 kg",
      "300g",
      "1 Variant",
    ];

    return {
      id: i + 1,
      name: `Product ${i + 1}`,
      brand: "Brand",
      variant: variants[i],
      weight: weights[i],
      price: `₹${discountPrice}`,
      originalPrice: `₹${originalPrice}`,
      discount: discount,
      rating: 4.2 + i * 0.1,
      reviews: 45 + i * 10,
      image: `/prod${(i % 9) + 1}.png`,
    };
  });

  const scroll = (dir) => {
    const el = scrollParent.current;
    if (!el) return;
    const offset = el.clientWidth * 0.6;
    el.scrollBy({
      left: dir === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full bg-white py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full bg-[#f8f3ee] rounded-xl p-3 md:p-4">
          <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-0">
            {/* Left promo - Full width on mobile, 14% width on large screens */}
            <div className="w-full lg:w-[14%] flex-shrink-0">
              <div className="bg-white rounded-lg p-3 md:p-4 w-full h-full flex flex-col items-center justify-center text-center min-h-[120px] lg:min-h-0">
                <div className="text-xs md:text-sm uppercase text-gray-500">
                  Mega Offer
                </div>
                <h2 className="text-xl md:text-2xl font-bold mt-2">
                  {sectionName || "MEGA MONSOON"}
                </h2>
                <p className="text-xs md:text-sm text-gray-600 mt-2">
                  Limited time deals on hot picks
                </p>
                <div className="mt-3">
                  <a
                    href="#"
                    className="flex items-center justify-center text-xs text-white bg-[#FF6B00] hover:bg-[#e65c00] px-4 py-2 rounded-full font-medium"
                  >
                    View All →
                  </a>
                </div>
              </div>
            </div>

            {/* Right scroll area - Full width on mobile, 86% on large screens */}
            <div className="w-full lg:w-[86%]">
              <div className="bg-white rounded-xl p-3 md:p-4 h-full min-h-[200px] lg:min-h-0">
                <div className="relative">
                  {/* Scroll buttons: circular green background, black arrow, slightly overlaying the cards */}
                  {/* Hidden on mobile, visible on lg+ */}
                  <div className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 z-30 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto">
                    <button
                      onClick={() => scroll("left")}
                      aria-label="Scroll left"
                      className="bg-emerald-500 text-black w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 md:w-5 md:h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 15.707a1 1 0 01-1.414 0L6.586 11l4.707-4.707a1 1 0 011.414 1.414L9.414 11l3.293 3.293a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 z-30 opacity-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto">
                    <button
                      onClick={() => scroll("right")}
                      aria-label="Scroll right"
                      className="bg-emerald-500 text-black w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 md:w-5 md:h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L11.586 9 7.293 4.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div
                    ref={scrollParent}
                    className="overflow-x-auto scrollbar-hide py-2 px-1 md:px-2 snap-x snap-mandatory"
                  >
                    <div className="flex gap-3 md:gap-4 items-stretch">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          className="min-w-[160px] md:min-w-[200px] lg:min-w-[220px] bg-white rounded-xl shadow p-2 md:p-3 flex-shrink-0 snap-center"
                        >
                          <div className="relative w-full h-28 md:h-32 lg:h-36 bg-gray-50 rounded-md overflow-hidden">
                            {p.discount && (
                              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                -{p.discount}%
                              </div>
                            )}
                            <Image
                              src={p.image}
                              alt={p.name}
                              fill
                              sizes="(max-width: 768px) 160px, (max-width: 1024px) 200px, 220px"
                              className="object-contain p-2 md:p-3"
                            />
                          </div>
                          <div className="mt-2">
                            <div className="text-xs md:text-sm font-medium text-gray-800 truncate">
                              {p.name}
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              {p.brand}
                            </div>
                            <div className="mb-1">
                              <p className="text-xs font-medium text-gray-700">
                                {p.variant}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {p.weight}
                              </p>
                            </div>
                            <div className="mt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm md:text-base font-semibold text-gray-900">
                                  {p.price}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  {p.originalPrice}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-3 h-3 ${
                                        star <= Math.round(p.rating)
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 0 0 .95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 0 0-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 0 0-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 0 0-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 0 0 .95-.69l1.286-3.967z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-xs text-gray-600">
                                  {p.rating.toFixed(1)} ({p.reviews})
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MegaMonsoon;
