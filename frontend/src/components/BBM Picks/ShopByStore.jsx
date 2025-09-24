import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { fetchRecommendedStores } from "../../utils/supabaseApi"; // Adjust this import path as needed
import { Link } from "react-router-dom";

const BbmPicks = ({ 
  title = "Shop By Store", 
  mode = "scroll",
  forceShow = false
}) => {
  const location = useLocation();
  
  // State for managing data, loading, and errors
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storesData = await fetchRecommendedStores();
        // The API provides { name, image_url }, but the component needs { label, image }.
        // We format the data here to match what the JSX expects.
        const formattedItems = storesData.map(store => ({
          id: store.id, 
          label: store.name,
          image: store.image_url,
        }));
        setItems(formattedItems);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []); // The empty dependency array means this runs once when the component mounts.

  // Don't render anything if it's not the home route (unless forced)
  if (!forceShow && location.pathname !== "/") {
    return null;
  }
  
  // Display a loading message while fetching
  if (loading) {
      return <p className="p-3 text-sm">Loading Shop By Store...</p>;
  }

  // Display an error message if the fetch fails
  if (error) {
      return console.log(error);
  }

  // --- Your original rendering logic remains the same below ---

  const containerClass =
    mode === "grid"
      ? "grid grid-cols-3 gap-1"
      : "flex overflow-x-auto hide-scrollbar";
  
  const imageWrapperClass =
    mode === "grid"
      ? " rounded-full overflow-hidden flex-shrink-1"
      : "w-20 h-20 rounded-full overflow-hidden border border-gray-200 flex-shrink-0";

  const itemClass =
    mode === "grid"
      ? "flex flex-col items-center"
      : "flex flex-col items-center flex-shrink-0 w-[70px] mr-3";

  return (
    <div className="w-full gap-4 p-3 pt-0 md:hidden">
      {/* Section Title */}
      <h2 className="flex text-sm font-semibold text-gray-900 mb-3">
        Shop By Store <ChevronRight />
      </h2>

      {/* Items */}
      <div className={containerClass}>
        {items.map((item, index) => (
          <div key={index} className={itemClass}>
            {/* Circle Image */}
            <Link 
              to={`/ProductLisingPage/shop-by-product/${item.id}`} 
              state={{ 
                selectedStore: item,
                allStores: items // Pass all stores for sliding functionality
              }}
            >
            <div className={imageWrapperClass}>
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
            </Link>
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