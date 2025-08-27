import React from "react";
import { useLocation } from "react-router-dom";

const featuredItems = [
  {
    id: 1,
    label: "Newly Launched",
    img: "https://i.postimg.cc/Bb8cm4VQ/download-1.jpg",
    tag: "NEWLY LAUNCHED",
  },
  {
    id: 2,
    label: "Derma Store",
    img: "https://i.postimg.cc/Bb8cm4VQ/download-1.jpg",
    tag: "Featured",
  },
  {
    id: 3,
    label: "Trending Near You",
    img: "https://i.postimg.cc/rmZNGKgP/download-2.jpg",
    tag: "Featured",
  },
  {
    id: 4,
    label: "Special Offers",
    img: "https://i.postimg.cc/rmZNGKgP/download-2.jpg",
    tag: "Featured",
  },
  {
    id: 5,
    label: "Top Rated",
    img: "https://i.postimg.cc/rmZNGKgP/download-2.jpg",
    tag: "Featured",
  },
];

const FeaturedThisWeek = () => {
  const location = useLocation();

  // Show only on home route (/)
  if (location.pathname !== "/") return null;

  return (
    <div className="block md:hidden px-3 py-2 bg-white">
      <h2 className="text-lg font-semibold mb-3">Featured this week</h2>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar">
        {featuredItems.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 w-[28%] sm:w-[24%] rounded-xl shadow-md overflow-hidden border bg-white"
          >
            <div className="relative">
              <img
                src={item.img}
                alt={item.label}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default FeaturedThisWeek;
