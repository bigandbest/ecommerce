import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserAddresses } from "../utils/supabaseApi.js";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("visibility");

  // State for the address chosen from the map/search page
  const [mapSelection, setMapSelection] = useState(() => {
    const stored = localStorage.getItem("mapSelection");
    return stored ? JSON.parse(stored) : null;
  });

  // Final address chosen for placing the order
  const [orderAddress, setOrderAddress] = useState(() => {
    const stored = localStorage.getItem("orderAddress");
    return stored ? JSON.parse(stored) : null;
  });

  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    if (mapSelection) {
      localStorage.setItem("mapSelection", JSON.stringify(mapSelection));
    } else {
      localStorage.removeItem("mapSelection");
    }
  }, [mapSelection]);

  useEffect(() => {
    if (orderAddress) {
      localStorage.setItem("orderAddress", JSON.stringify(orderAddress));
    } else {
      localStorage.removeItem("orderAddress");
    }
  }, [orderAddress]);

  // Fetch saved user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!currentUser?.id) return;
      const { success, addresses, error } = await getUserAddresses(currentUser.id);
      if (!success) {
        console.error("Failed to fetch addresses:", error);
        return;
      }
      setAddresses(addresses);
    };
    fetchAddresses();
  }, [currentUser]);

  const clearLocationData = () => {
    setMapSelection(null);
    setOrderAddress(null);
    localStorage.removeItem("mapSelection");
    localStorage.removeItem("orderAddress");
  };

  return (
    <LocationContext.Provider
      value={{
        showModal,
        setShowModal,
        mapSelection,       // Expose new state
        setMapSelection,    // Expose new setter
        addresses,
        setAddresses,
        clearLocationData,
        orderAddress,
        setOrderAddress,
        modalMode,
        setModalMode,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
export default LocationContext;