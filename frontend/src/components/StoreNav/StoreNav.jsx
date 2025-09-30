import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchStores } from "../../utils/supabaseApi.js";

export default function StoreNav({ onClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const data = await fetchStores();
        setStores(data || []);
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
    <div className="flex overflow-x-auto whitespace-nowrap py-2 px-2 gap-0 hide-scrollbar">
      {stores.map((store) => {
        const path = store.path || "/";
        const isActive = location.pathname === path;

        return (
          <button
            key={store.id}
            type="button"
            title={store.name}
            aria-label={store.name}
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              navigate(store.link || path);
              if (onClick) onClick(store.name);
            }}
            className={[
              "shrink-0 w-14 h-14 bg-gray-200",
              "flex flex-col items-center justify-center",
              "transition-all duration-150"
            ].join(" ")}
          >
            <img
              src={store.image}
              alt=""
              className="w-9 h-9 object-contain"
              draggable={false}
            />
            <p className="text-xs">{store.name}</p>
          </button>
        );
      })}
    </div>
  );
}
