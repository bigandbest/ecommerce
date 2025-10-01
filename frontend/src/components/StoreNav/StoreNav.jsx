import React, { useState, useEffect } from "react";
// 💡 CHANGE 1: Import Link from react-router-dom to replace <a> tag functionality
import { useLocation, useNavigate, Link } from "react-router-dom";
import { fetchStores } from "../../utils/supabaseApi.js";

// FIX 1: Corrected 'expo default' to 'export default function'
export default function StoreNav({ onClick }) {
  const location = useLocation();
  // FIX 2: Added state for stores and loading/error handling, and the setStores function
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIX 3: Encapsulated data fetching logic within a useEffect hook
  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await fetchStores();
        setStores(data);
      } catch (err) {
        console.error("Error fetching stores:", err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadStores();
  }, []); // Empty dependency array ensures it runs only once on mount

  // Check if the current path is relevant for this navigation component
  if (location.pathname !== "/all" && location.pathname !== "/") {
    return null;
  }
  
  if (loading) {
      return <div className="p-4 text-center text-gray-500">Loading stores...</div>;
  }

  // FIX 3 (Cont.): The component must return JSX directly
  return (
    <div className="flex overflow-x-auto whitespace-nowrap py-2 px-2 gap-0 hide-scrollbar">
      {stores.map((store) => {
        // Assuming 'store' objects have a 'path' property for the Link's 'to' prop
        const isActive = location.pathname === store.path; 
        return (
          // FIX 4: Changed <a> tag to <Link> component for React Router
          <Link
            key={store.id}
            to={store.link || "/"} // Use 'to' instead of 'href' for Link
            className={`flex flex-col items-center w-[65px] py-1 rounded-lg font-medium shadow-sm transition-colors shrink-0
              ${isActive ? "bg-blue-100" : "bg-gray-200"}
              ${isActive ? "" : "hover:bg-gray-300"}
            `}
            onClick={() => {
              // Execute the optional onClick handler
              if (onClick) onClick(store.name); 
            }}
          >
            <img
              src={store.image}
              alt={store.name}
              className="w-9 h-9 object-contain"
            />
            <span className="text-xs">{store.name}</span>
          </Link>
        );
      })}
    </div>
  );
}