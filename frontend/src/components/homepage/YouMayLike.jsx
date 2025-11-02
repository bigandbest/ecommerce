"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const YouMayLike = ({ sectionName }) => {
  const [favorites, setFavorites] = useState({});
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const [equalHeightPx, setEqualHeightPx] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia("(min-width: 1024px)");

    const adjust = () => {
      if (!mq.matches) {
        setEqualHeightPx(null);
        return;
      }

      const leftH = leftColRef.current ? leftColRef.current.offsetHeight : 0;
      const rightH = rightColRef.current ? rightColRef.current.offsetHeight : 0;
      const maxH = Math.max(leftH, rightH);
      setEqualHeightPx(maxH ? maxH + 2 : null);
    };

    const run = () => setTimeout(adjust, 50);

    run();
    window.addEventListener("resize", run);
    window.addEventListener("load", run);

    return () => {
      window.removeEventListener("resize", run);
      window.removeEventListener("load", run);
    };
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const products = [
    {
      id: 1,
      name: "Premium Protein",
      price: "₹50",
      originalPrice: "₹100",
      image: "/prod1.png",
      brand: "Freshie",
      variant: "Chocolate Flavor",
      weight: "1 kg",
      rating: 4.2,
      reviews: 45,
      discount: 50,
    },
    {
      id: 2,
      name: "JK Copier Paper",
      price: "₹291",
      originalPrice: "₹385",
      image: "/prod2.png",
      brand: "Rich",
      variant: "A4 Size",
      weight: "500 sheets",
      rating: 4.5,
      reviews: 78,
      discount: 24,
    },
    {
      id: 3,
      name: "Think and Grow Rich",
      price: "₹299",
      originalPrice: "₹399",
      image: "/prod3.png",
      brand: "Books",
      variant: "Paperback",
      weight: "1 Edition",
      rating: 4.7,
      reviews: 92,
      discount: 25,
    },
    {
      id: 4,
      name: "Zebronics Bluetooth",
      price: "₹899",
      originalPrice: "₹1299",
      image: "/prod4.png",
      brand: "Zebronics",
      variant: "Wireless",
      weight: "1 Variant",
      rating: 4.3,
      reviews: 156,
      discount: 31,
    },
    {
      id: 5,
      name: "Milton Lunch Box",
      price: "₹549",
      originalPrice: "₹799",
      image: "/prod5.png",
      brand: "Milton",
      variant: "Steel",
      weight: "2 Containers",
      rating: 4.1,
      reviews: 67,
      discount: 31,
    },
    {
      id: 6,
      name: "Energy Booster",
      price: "₹2344",
      originalPrice: "₹3000",
      image: "/prod6.png",
      brand: "Fitness",
      variant: "Pre-Workout",
      weight: "500g",
      rating: 4.6,
      reviews: 34,
      discount: 22,
    },
    {
      id: 7,
      name: "Wireless Headphones",
      price: "₹1299",
      originalPrice: "₹1999",
      image: "/prod7.png",
      brand: "PUMA",
      variant: "Noise Cancelling",
      weight: "1 Variant",
      rating: 4.4,
      reviews: 89,
      discount: 35,
    },
    {
      id: 8,
      name: "Smart Watch",
      price: "₹2499",
      originalPrice: "₹3499",
      image: "/prod8.png",
      brand: "Tech",
      variant: "Fitness Tracker",
      weight: "1 Variant",
      rating: 4.8,
      reviews: 123,
      discount: 29,
    },
    {
      id: 9,
      name: "Power Bank",
      price: "₹899",
      originalPrice: "₹1299",
      image: "/prod9.png",
      brand: "Power",
      variant: "Fast Charging",
      weight: "10000mAh",
      rating: 4.0,
      reviews: 56,
      discount: 31,
    },
  ];

  const bestSix = [
    products[2],
    products[0],
    products[3],
    products[4],
    products[6],
    products[7],
  ].filter(Boolean);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          {/* Left: You may like */}
          <div className="w-full lg:w-1/2 lg:h-full flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 lg:mb-4">
              <h2 className="text-xl font-bold text-black">
                {sectionName || "You may like..."}
              </h2>
              <a
                href="#"
                className="hidden lg:flex text-sm text-white bg-[#FF6B00] hover:bg-[#e65c00] px-3 py-1 rounded hover:underline"
              >
                View All
              </a>
            </div>
            <div
              ref={leftColRef}
              style={equalHeightPx ? { height: equalHeightPx } : {}}
              className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-square bg-gray-50">
                    {product.discount && (
                      <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        -{product.discount}%
                      </div>
                    )}
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 mb-1">
                      {product.name}
                    </h3>
                    <div className="text-xs text-gray-500 mb-1">
                      {product.brand}
                    </div>
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700">
                        {product.variant}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {product.weight}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-xs sm:text-sm font-bold text-gray-900">
                        {product.price}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                        {product.originalPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(product.rating)
                                ? "text-yellow-400"
                                : "text-gray-200"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 0 0 .95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 0 0-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 0 0-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 0 0-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 0 0 .95-.69l1.286-3.967z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        ({product.reviews})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4 lg:hidden">
              <a
                href="#"
                className="flex items-center justify-center text-sm text-white bg-[#FF6B00] hover:bg-[#e65c00] px-6 py-2 rounded-full font-medium"
              >
                View All →
              </a>
            </div>
          </div>

          {/* Right: Best quality */}
          <aside className="w-full lg:w-1/2 lg:h-full flex flex-col min-h-0">
            <div className="bg-transparent flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-black">Best Rating</h3>
                <a
                  href="#"
                  className="hidden lg:flex text-sm text-white bg-[#FF6B00] hover:bg-[#e65c00] px-3 py-1 rounded hover:underline"
                >
                  View All
                </a>
              </div>

              <div
                ref={rightColRef}
                style={equalHeightPx ? { height: equalHeightPx } : {}}
                className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 flex-1 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 h-full overflow-auto p-1">
                  {bestSix.map((p) => (
                    <div
                      key={p.id}
                      className="bg-gray-50 rounded-lg overflow-hidden flex flex-col"
                    >
                      <div className="relative w-full pb-[100%] overflow-hidden">
                        {p.discount && (
                          <div className="absolute top-1 left-1 z-10 bg-red-500 text-white text-[10px] font-bold px-1 py-0.5 rounded">
                            -{p.discount}%
                          </div>
                        )}
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div className="p-2 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-800">
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
                        </div>
                        <div className="flex items-center gap-1 mt-1 mb-1">
                          <span className="text-[10px] sm:text-xs font-bold text-gray-900">
                            {p.price}
                          </span>
                          <span className="text-[8px] sm:text-[10px] text-gray-500 line-through">
                            {p.originalPrice}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-2.5 h-2.5 ${
                                  i < Math.floor(p.rating)
                                    ? "text-yellow-400"
                                    : "text-gray-200"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 0 0 .95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 0 0-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 0 0-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 0 0-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 0 0 .95-.69l1.286-3.967z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-500">
                            ({p.reviews})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center mt-4 lg:hidden">
                <a
                  href="#"
                  className="flex items-center justify-center text-sm text-white bg-[#FF6B00] hover:bg-[#e65c00] px-6 py-2 rounded-full font-medium"
                >
                  View All →
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default YouMayLike;
