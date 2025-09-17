import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useLocationContext } from '../../contexts/LocationContext';
import { LocateFixed } from 'lucide-react'; // For a nice icon

// Fix for default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapLocationPage = () => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false); // Used for both initial load and processing
  const { setMapSelection } = useLocationContext();
  const navigate = useNavigate();
  const markerRef = useRef(null);
  const mapRef = useRef(null);

  // Function to get the user's current location
  const fetchCurrentLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newPos = [latitude, longitude];
        setPosition(newPos);
        if (mapRef.current) {
          mapRef.current.flyTo(newPos, 16);
        }
        setLoading(false);
      },
      () => {
        // If permission is denied, default to Delhi and inform the user
        setPosition([28.6139, 77.2090]); 
        setLoading(false);
        alert("Location access denied. The map has been centered on Delhi.");
      },
      { enableHighAccuracy: true } // Request a more accurate position
    );
  };

  // Set a default position on initial load
  useEffect(() => {
    setPosition([28.6139, 77.2090]); // Default to Delhi initially
  }, []);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition([marker.getLatLng().lat, marker.getLatLng().lng]);
        }
      },
    }),
    [],
  );

  const handleConfirmLocation = async () => {
    if (!position) return alert("Location not set.");
    setLoading(true);
    try {
      const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${position[0]}+${position[1]}&key=${import.meta.env.VITE_OPENCAGE_API_KEY}`);
      const data = await response.json();
      const result = data?.results?.[0];

      if (result) {
        const locationData = {
          latitude: position[0],
          longitude: position[1],
          formatted_address: result.formatted,
          is_geolocation: true,
          city: result.components.city || result.components.town || "",
          state: result.components.state || "",
          postal_code: result.components.postcode || "",
          country: result.components.country || "",
        };
        setMapSelection(locationData);
        navigate('/checkout/confirm-address'); // Navigate to the next step
      } else {
        alert("Could not retrieve address details for this location.");
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
      alert("Failed to process location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Pinpoint Your Location</h1>
      
      {/* Button to fetch current location */}
      <div className="text-center mb-4">
        <button
          onClick={fetchCurrentLocation}
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 flex items-center justify-center mx-auto"
        >
          <LocateFixed size={18} className="mr-2" />
          Use My Current Location
        </button>
      </div>

      <div style={{ height: '500px', width: '100%', position: 'relative' }}>
        {position ? (
          <MapContainer center={position} zoom={13} style={{ height: '100%' }} ref={mapRef}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={position}
              ref={markerRef}
            />
          </MapContainer>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <p>Loading Map...</p>
          </div>
        )}
      </div>
      <div className="text-center mt-6">
        <button
          onClick={handleConfirmLocation}
          disabled={loading || !position}
          className="bg-primary text-white py-3 px-8 rounded-md hover:bg-primary-dark transition duration-200 disabled:bg-gray-400"
          style={{ backgroundColor: '#3f51b5' }}
        >
          {loading ? 'Processing...' : 'Confirm This Location'}
        </button>
      </div>
    </div>
  );
};

export default MapLocationPage;