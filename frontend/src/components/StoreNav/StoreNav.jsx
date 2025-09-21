import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchStores } from "../../utils/supabaseApi.js"; // 👈 import helper

export default function StoreNav({ onClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await fetchStores();
        setStores(data);
      } catch (err) {
        console.error("Error fetching stores:", err.message);
      }
    };
    loadStores();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isMobile) return null;
  if (location.pathname !== "/all" && location.pathname !== "/") return null;

  return (
    <div className="flex overflow-x-auto whitespace-nowrap py-1 hide-scrollbar">
      {stores.map((store) => {
        const isActive = location.pathname === store.path;

        return (
          <a
            key={store.id}
            href={store.link || "/"} // fallback to "/" if link is missing
            className={`flex flex-col items-center w-[90px] py-1 rounded-lg font-medium shadow-sm transition-colors shrink-0
    ${isActive ? "bg-blue-100" : "bg-gray-200"}
    ${isActive ? "" : "hover:bg-gray-300"}
  `}
            onClick={() => {
              if (onClick) onClick(store.name);
            }}
          >
            <img
              src={store.image}
              alt={store.name}
              className="w-20 h-20 mb-1 rounded-md object-cover"
            />
            <span className="truncate text-center">{store.name}</span>
          </a>

        );
      })}
    </div>
  );
}
