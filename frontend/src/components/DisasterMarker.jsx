import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const getSeverityColor = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'high':
    case 'critical':
      return '#dc2626'; // red-600
    case 'medium':
      return '#ea580c'; // orange-600
    case 'low':
      return '#ca8a04'; // yellow-600
    default:
      return '#dc2626'; // red-600
  }
};

const createDisasterIcon = (severity) => {
  const color = getSeverityColor(severity);
  return L.divIcon({
    className: 'custom-disaster-marker',
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
      animation: pulse-red 2s infinite;
    ">🚨</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};


export default function DisasterMarker({ disaster }) {
  const { location, disasterType, severity, affectedPeople, resourcesNeeded, description, createdAt } = disaster;

  if (!location?.coordinates) return null;

  const [lng, lat] = location.coordinates;

  return (
    <Marker
      position={[lat, lng]}
      icon={createDisasterIcon(severity)}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-bold text-lg text-red-600 mb-2">
            🚨 {disasterType || 'Disaster Alert'}
          </h3>

          <div className="space-y-1 text-sm">
            <p><strong>Severity:</strong>
              <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                severity?.toLowerCase() === 'high' || severity?.toLowerCase() === 'critical'
                  ? 'bg-red-100 text-red-800'
                  : severity?.toLowerCase() === 'medium'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {severity || 'Unknown'}
              </span>
            </p>

            {affectedPeople && (
              <p><strong>Affected People:</strong> {affectedPeople}</p>
            )}

            {resourcesNeeded && resourcesNeeded.length > 0 && (
              <div>
                <strong>Resources Needed:</strong>
                <ul className="ml-4 mt-1">
                  {resourcesNeeded.map((resource, index) => (
                    <li key={index} className="text-xs">• {resource}</li>
                  ))}
                </ul>
              </div>
            )}

            {description && (
              <p><strong>Description:</strong> {description}</p>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Reported: {new Date(createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}