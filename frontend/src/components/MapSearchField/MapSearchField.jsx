// src/components/MapSearch/MapSearchField.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

const MapSearchField = ({ onLocationFound }) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      showMarker: false, // We will handle the marker ourselves
      autoClose: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    // Listen for the search result event
    const onResult = (e) => {
      onLocationFound({ lat: e.location.y, lng: e.location.x });
    };

    map.on('geosearch/showlocation', onResult);

    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', onResult);
    };
  }, [map, onLocationFound]);

  return null; // This component does not render anything itself
};

export default MapSearchField;