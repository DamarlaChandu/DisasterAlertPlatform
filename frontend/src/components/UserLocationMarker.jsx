import { Marker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

// Create a custom icon for user location
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `<div style="
      background-color: #10b981;
      width: 20px;
      height: 20px;
      border-radius: 50% 50% 50% 0;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transform: rotate(-45deg);
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });
};

export default function UserLocationMarker({ position }) {
  const map = useMap();

  // Update map center when position changes
  useEffect(() => {
    if (position && map) {
      map.setView([position.latitude, position.longitude], map.getZoom());
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={createUserLocationIcon()}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-bold text-green-600 mb-1">📍 Your Location</h3>
          <p className="text-sm text-gray-600">
            Latitude: {position.latitude.toFixed(6)}<br />
            Longitude: {position.longitude.toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
}