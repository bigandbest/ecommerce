import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { fetchBandBs } from "../../utils/supabaseApi"; // 👈 Import the new API function

function Quickyfy({ 
  mode = "scroll",
  forceShow = false
}) {
  const [bnbItems, setBnbItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBandBs() {
      try {
        setLoading(true);
        const data = await fetchBandBs();
        setBnbItems(data || []);
      } catch (err) {
        console.error("Error fetching B&B items:", err.message);
        setError(err.message)
        setBnbItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadBandBs();
  }, []);


  // Only show on home route
  if (!forceShow && location.pathname !== "/") {
    return null;
  }

  // Conditional container styles
  const containerClass =
    mode === "grid"
      ? "grid grid-cols-3 gap-1"
      : "flex overflow-x-auto hide-scrollbar snap-x";

  const itemClass =
    mode === "grid"
      ? "flex flex-col items-center"
      : "flex flex-col items-center flex-shrink-0 w-[25%] mr-1 snap-start";

  if (loading) {
    return <div>Loading B&B...</div>;
  }


  if(error){
    return console.log(error);
  }

  return (
    <div className="w-full gap-4 p-3 md:hidden">
      {/* Section Title */}
      <h2 className="flex text-sm font-semibold text-gray-900 mb-3">
        B&B Expertise <ChevronRight />
      </h2>

      {/* Items */}
      <div className={containerClass}>
        {bnbItems.map((item) => (
          // 👇 Wrap with Link to the dynamic route
          <Link to={`/b&b/${item.id}`} key={item.id} className={itemClass}>
            {/* Card Style Image */}
            <div className="w-full rounded-md overflow-hidden border border-gray-200">
              <img
                src={item.image_url} // 👈 Use image_url from fetched data
                alt={item.name}     // 👈 Use name from fetched data
                className="w-full h-full rounded-md object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/100x100?text=Image";
                }}
              />
            </div>
            {/* Label */}
            <p className="mt-1 text-sm text-gray-700 text-center truncate w-full">
              {item.name} 
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Quickyfy;
