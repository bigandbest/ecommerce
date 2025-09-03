import React from "react";
import { Link } from "react-router-dom";

const ProductBannerSlider = ({ count = 3, bannerUrl }) => {
  // Dummy product data
  const productData = [
    {
      id: 1,
      name: "Skore Vibrating Ring – BuzzZ",
      price: "₹2151",
      oldPrice: "₹2500",
      save: "SAVE ₹349",
      img: "https://i.postimg.cc/0NDbVTtd/21-removebg-preview.png",
    },
    {
      id: 2,
      name: "Mischief Crescendo Dual Spot",
      price: "₹3039",
      oldPrice: "₹3299",
      save: "SAVE ₹260",
      img: "https://i.postimg.cc/rwZXC126/Product-Showcase-1-removebg-preview.png",
    },
    {
      id: 3,
      name: "Skore Shine Ring",
      price: "₹540",
      oldPrice: "₹700",
      save: "SAVE ₹160",
      img: "https://i.postimg.cc/2SSNZHJF/Product-removebg-preview.png",
    },
  ];

  return (
    <div className="space-y-8 md:hidden">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative rounded-xl shadow-md overflow-hidden"
        >
          {/* Banner Background */}
          <div
            className="h-[530px] bg-cover bg-center flex flex-col justify-end p-1"
            style={{
              backgroundImage: `url('${bannerUrl}')`,
            }}
          >
            {/* Product Cards - Scrollable */}
            <div className="flex space-x-2 overflow-x-auto align-middle hide-scrollbar">
              {productData.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow p-3 flex-shrink-0 w-40 sm:w-56 flex flex-col"
                >
                  {/* Product Image */}
                  <div>
                    <img
                      src={product.img}
                      alt={product.name}
                      className="h-28 w-full object-contain mb-2"
                    />
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-x-1 mt-1">
                    <p className="text-sm font-bold">{product.price}</p>
                    <p className="text-xs line-through text-gray-400">
                      {product.oldPrice}
                    </p>
                  </div>

                  {/* Quantity & Save */}
                  <div className="mt-0.5 text-xs">1pc</div>
                  <div className="mt-0.5 text-green-600 text-xs">
                    {product.save}
                  </div>

                  {/* Name */}
                  <h3 className="text-xs sm:text-sm font-medium line-clamp-2 mt-1 mb-2 flex-grow">
                    {product.name}
                  </h3>

                  {/* Button at same height */}
                  <button className="bg-pink-500 text-white text-xs px-3 py-1 rounded-lg w-full mt-auto">
                    ADD
                  </button>
                </div>
              ))}
            </div>

            {/* See All Button */}
            <Link to={"/productListing"}>
              <div className="bg-red-900 text-white w-[90%] mx-auto rounded-xl text-center py-2 mt-2 cursor-pointer hover:bg-purple-800">
                See All →
              </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductBannerSlider;
