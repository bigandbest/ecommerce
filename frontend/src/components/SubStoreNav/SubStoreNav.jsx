import React, { useState, useEffect } from "react";
// 💡 Import Link for routing functionality
import { useLocation, useNavigate, Link } from "react-router-dom";
// 🎯 Import the SubStore API function
import { fetchSubStores } from "../../utils/supabaseApi.js"; // Assuming you place the functions here

export default function SubStoreNav({ onClick }) {
  const location = useLocation();
  // 🎯 State for substores and loading/error handling
  const [subStores, setSubStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🎯 Encapsulated data fetching logic
  useEffect(() => {
    const loadSubStores = async () => {
      try {
        // 🎯 Use the fetchSubStores function
        const data = await fetchSubStores();
        setSubStores(data);
      } catch (err) {
        console.error("Error fetching SubStores:", err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadSubStores();
  }, []); // Runs only once on mount

  // Check if the current path is relevant for this navigation component
  if (location.pathname !== "/all" && location.pathname !== "/") {
    return null;
  }
  
  if (loading) {
      return <div className="p-4 text-center text-gray-500">Loading SubStores...</div>;
  }

  return (
    <div className="flex overflow-x-auto whitespace-nowrap py-2 px-2 gap-0 hide-scrollbar md:hidden">
      {subStores.map((subStore) => {
        // Assuming 'subStore' objects have a 'link' property for navigation
        const isActive = location.pathname === subStore.link; // Check for active link
        return (
          <Link
            key={subStore.id}
            // 🎯 Use the 'link' property for the Link's destination
            to={subStore.link || "/"} 
            className={`flex flex-col items-center w-[65px] py-1 rounded-lg font-medium shadow-sm transition-colors shrink-0
              ${isActive ? "bg-blue-100" : "bg-gray-200"}
              ${isActive ? "" : "hover:bg-gray-300"}
            `}
            onClick={() => {
              // Execute the optional onClick handler
              if (onClick) onClick(subStore.name); 
            }}
          >
            <img
              // 🎯 Assuming the image column is named 'image'
              src={subStore.image}
              alt={subStore.name}
              className="w-9 h-9 object-contain"
            />
            <span className="text-xs">{subStore.name}</span>
          </Link>
        );
      })}
    </div>
  );
}