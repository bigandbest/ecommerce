import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Create a custom provider that calls your backend proxy
class ProxyProvider {
  async search({ query }) {
    try {
      // This URL must match the route you set up on your server
      const response = await fetch(`https://ecommerce-8342.onrender.com/api/location/search?q=${query}`);
      if (!response.ok) return []; // Handle server errors gracefully
      
      const results = await response.json();

      // Format the results to what leaflet-geosearch expects
      return results.map((result) => ({
        x: result.lon, // longitude
        y: result.lat, // latitude
        label: result.display_name,
        bounds: [
          [parseFloat(result.boundingbox[0]), parseFloat(result.boundingbox[2])],
          [parseFloat(result.boundingbox[1]), parseFloat(result.boundingbox[3])],
        ],
      }));
    } catch (error) {
      console.error("Search proxy error:", error);
      return []; // Return empty array on network failure
    }
  }
}

const MapSearchField = ({ onLocationFound }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new ProxyProvider(); // Use the custom provider

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false,
      autoClose: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    const onResult = (e) => {
      onLocationFound({ lat: e.location.y, lng: e.location.x });
    };

    map.on('geosearch/showlocation', onResult);

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', onResult);
    };
  }, [map, onLocationFound]);

  return null;
};

export default MapSearchField;