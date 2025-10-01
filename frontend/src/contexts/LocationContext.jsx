// src/contexts/LocationContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUserAddresses } from "../utils/supabaseApi.js";
import axios from "axios";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("visibility");

  // RESTORED: State for tracking if the user manually cleared the location.
  // Initializes from localStorage by comparing the string "true".
  const [locationCleared, setLocationCleared] = useState(() => {
    const stored = localStorage.getItem("locationCleared");
    return stored === "true";
  });

  // This is the primary active location for the app (from saved, pincode, or GPS)
  const [selectedAddress, setSelectedAddress] = useState(() => {
    const stored = localStorage.getItem("selectedAddress");
    return stored ? JSON.parse(stored) : null;
  });
  
  // This is the specific address for placing an order (set during checkout)
  const [orderAddress, setOrderAddress] = useState(() => {
    const stored = localStorage.getItem("orderAddress");
    return stored ? JSON.parse(stored) : null;
  });

  // This is for the GPS location chosen from the map page
  const [mapSelection, setMapSelection] = useState(() => {
    const stored = localStorage.getItem("mapSelection");
    return stored ? JSON.parse(stored) : null;
  });

  // Holds the user's list of saved addresses
  const [addresses, setAddresses] = useState([]);
  
  // Holds the formatted string of a reverse-geocoded address
  const [currentLocationAddress, setCurrentLocationAddress] = useState(null);
  
  // Tracks loading state for geolocation fetching
  const [isLocationLoading, setLocationLoading] = useState(false);


  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem("selectedAddress", JSON.stringify(selectedAddress));
    } else {
      localStorage.removeItem("selectedAddress");
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (orderAddress) {
      localStorage.setItem("orderAddress", JSON.stringify(orderAddress));
    } else {
      localStorage.removeItem("orderAddress");
    }
  }, [orderAddress]);

  useEffect(() => {
    if (mapSelection) {
      localStorage.setItem("mapSelection", JSON.stringify(mapSelection));
    } else {
      localStorage.removeItem("mapSelection");
    }
  }, [mapSelection]);
  
  // RESTORED: Persists the locationCleared flag to localStorage.
  useEffect(() => {
    localStorage.setItem("locationCleared", locationCleared.toString());
  }, [locationCleared]);


  // --- DATA FETCHING & LOGIC ---

  // Fetch saved user addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!currentUser?.id) {
        setAddresses([]);
        return;
      }
      const { success, addresses } = await getUserAddresses(currentUser.id);
      if (success) {
        setAddresses(addresses);

        // RESTORED: Smartly set default address only on initial load.
        const defaultAddress = addresses.find((addr) => addr.is_default);
        if (!selectedAddress && defaultAddress && !locationCleared) {
          setSelectedAddress(defaultAddress);
        }
      }
    };
    fetchAddresses();
  }, [currentUser, locationCleared]); // Depends on locationCleared now

  // Centralized function to get and set the user's current GPS location
  const useCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported."));
        return;
      }
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Fallback solution without OpenCage API
            const locationData = {
              address_name: "Current Location",
              postal_code: "",
              state: "",
              city: "Current Location",
              street_address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
              latitude,
              longitude,
              formatted_address: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              is_geolocation: true,
            };
            setSelectedAddress(locationData);
            setCurrentLocationAddress(locationData.formatted_address);
            setLocationCleared(false);
            resolve(locationData);
          } catch (error) {
            reject(error);
          } finally {
            setLocationLoading(false);
          }
        },
        (error) => {
          setLocationLoading(false);
          reject(error);
        }
      );
    });
  };

  // Clears all location-related data and sets the cleared flag
  const clearLocationData = () => {
    setSelectedAddress(null);
    setCurrentLocationAddress(null);
    setMapSelection(null);
    setOrderAddress(null);
    setLocationCleared(true); // Mark location as manually cleared
  };

  return (
    <LocationContext.Provider
      value={{
        showModal,
        setShowModal,
        modalMode,
        setModalMode,
        addresses,
        setAddresses,
        selectedAddress,
        setSelectedAddress,
        currentLocationAddress,
        setCurrentLocationAddress,
        isLocationLoading,
        locationCleared,
        setLocationCleared,
        useCurrentLocation,
        orderAddress,
        setOrderAddress,
        mapSelection,
        setMapSelection,
        clearLocationData,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);