// src/pages/Checkout/MapLocationPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useLocationContext } from '../../contexts/LocationContext';
import MapSearchField from '../MapSearchField/MapSearchField'; // 👈 Import search

// Fix for default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapLocationPage = () => {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setGpsAddress } = useLocationContext(); // Use the clearer name
  const navigate = useNavigate();
  const markerRef = useRef(null);
  const mapRef = useRef(null);

  // 1. Get user's initial location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setLoading(false);
      },
      () => {
        // Default to a central location if permission is denied
        setPosition([28.6139, 77.2090]); // Default to Delhi
        setLoading(false);
        alert("Location access denied. Showing default location. Please search for your address.");
      }
    );
  }, []);

  // 2. Handle marker dragging
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

  // 3. Handle location found from search
  const handleLocationSearch = (coords) => {
      setPosition([coords.lat, coords.lng]);
      // Fly to the new location on the map
      if (mapRef.current) {
          mapRef.current.flyTo([coords.lat, coords.lng], 16);
      }
  };

  // 4. Final step: Use the location and reverse geocode
  const handleUseLocation = async () => {
    if (!position) {
      alert("Location not set. Please wait or search for a location.");
      return;
    }
    setLoading(true);
    try {
        // Manually call the reverse geocoding API with the final marker position
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${position[0]}+${position[1]}&key=f4a8c8f1a4c541f89f742dbc40672aea`);
        const data = await response.json();
        const result = data?.results?.[0];

        if (result) {
            const locationData = {
                latitude: position[0],
                longitude: position[1],
                formatted_address: result.formatted,
                is_geolocation: true, // Flag it as a map-derived address
                // You can add more components if you need them
                city: result.components.city || result.components.town,
                state: result.components.state,
                postal_code: result.components.postcode,
                country: result.components.country,
            };
            setGpsAddress(locationData);
            navigate('/checkout/confirm-address');
        } else {
            alert("Could not retrieve address details for this location. Please try a different spot.");
        }
    } catch (error) {
        console.error("Reverse geocoding failed", error);
        alert("Failed to process location. Please check your connection and try again.");
    } finally {
        setLoading(false);
    }
  };

  if (loading && !position) {
    return <div className="text-center py-10">Loading Map and Location...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Search or Drag to Pinpoint Your Location</h1>
      <div style={{ height: '500px', width: '100%', position: 'relative' }}>
        {position && (
          <MapContainer center={position} zoom={15} style={{ height: '100%' }} ref={mapRef}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker
              draggable={true}
              eventHandlers={eventHandlers}
              position={position}
              ref={markerRef}
            />
            <MapSearchField onLocationFound={handleLocationSearch} />
          </MapContainer>
        )}
      </div>
      <div className="text-center mt-6">
        <button
          onClick={handleUseLocation}
          disabled={loading}
          className="bg-primary text-white py-3 px-8 rounded-md hover:bg-primary-dark transition duration-200 disabled:bg-gray-400"
          style={{ backgroundColor: '#3f51b5' }}
        >
          {loading ? 'Processing...' : 'Use This Precise Location'}
        </button>
      </div>
    </div>
  );
};

export default MapLocationPage;