import React from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

function Stores({ 
  title = "Recommended Store", 
  items = [], 
  mode = "scroll",
  forceShow = false // 👈 NEW PROP
}) {
  const location = useLocation();

  // Only show on home route (keep your existing check if needed)
  if (!forceShow && location.pathname !== "/") {
    return null;
  }

  // Conditional classNames
  const containerClass =
    mode === "grid"
      ? "grid grid-cols-3 gap-2" // 👈 3x3 grid
      : "flex overflow-x-auto hide-scrollbar snap-x"; // 👈 scroll

  const imageClass =
    mode === "grid"
      ? "grid grid-cols-3 gap-2" // 👈 3x3 grid
      : "flex overflow-x-auto hide-scrollbar snap-x"; // 👈 scroll

  const itemClass =
    mode === "grid"
      ? "flex flex-col items-center" // grid item
      : "flex flex-col items-center flex-shrink-0 w-[55%] mr-1 snap-start"; // scroll item

  return (
    <div className="w-full gap-4 md:hidden p-3">
      {/* Section Title */}
      <h2 className="flex text-sm font-semibold text-gray-900 mb-3">
        {title} <ChevronRight />
      </h2>

      {/* Items */}
      <div className={containerClass}>
        {items.map((item, index) => (
          <div key={index} className={itemClass}>
            {/* Card Style Image */}
            <div className="w-full rounded-md overflow-hidden border">
              <img
                src={item.image}
                alt={item.label}
                className="w-full h-full rounded-md object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/100x100?text=Image";
                }}
              />
            </div>
            {/* Label */}
            <p className="mt-1 text-sm text-gray-700 text-center truncate w-full">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Stores;
