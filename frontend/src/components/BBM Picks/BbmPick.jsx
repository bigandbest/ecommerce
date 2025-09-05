import React from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const BbmPicks = ({ 
  title = "Recommended Store", 
  items = [], 
  mode = "scroll",
  forceShow = false // 👈 NEW PROP
}) => {
  const location = useLocation();

  // Only show on home route
  if (!forceShow && location.pathname !== "/") {
    return null;
  }

  // Conditional container styles
  const containerClass =
    mode === "grid"
      ? "grid grid-cols-3 gap-3"
      : "flex overflow-x-auto hide-scrollbar";

  const itemClass =
    mode === "grid"
      ? "flex flex-col items-center"
      : "flex flex-col items-center flex-shrink-0 w-[70px] mr-3";

  return (
    <div className="w-full gap-4 p-3 pt-0 md:hidden">
      {/* Section Title */}
      <h2 className="flex text-sm font-semibold text-gray-900 mb-3">
        {title} <ChevronRight />
      </h2>

      {/* Items */}
      <div className={containerClass}>
        {items.map((item, index) => (
          <div key={index} className={itemClass}>
            {/* Circle Image */}
            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
              <img
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/100x100?text=Image";
                }}
              />
            </div>
            {/* Label */}
            <p className="mt-1 text-[11px] text-gray-700 text-center truncate w-full">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BbmPicks;
