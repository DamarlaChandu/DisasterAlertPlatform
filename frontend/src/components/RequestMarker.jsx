import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const getUrgencyColor = (urgency) => {
  switch (urgency?.toLowerCase()) {
    case 'critical':
      return '#dc2626'; // red-600
    case 'high':
      return '#ea580c'; // orange-600
    case 'medium':
      return '#ca8a04'; // yellow-600
    case 'low':
      return '#16a34a'; // green-600
    default:
      return '#2563eb'; // blue-600
  }
};

const createRequestIcon = (urgency) => {
  const color = getUrgencyColor(urgency);
  return L.divIcon({
    className: 'custom-request-marker',
    html: `<div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: 2px solid white;
      box-shadow: 0 3px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
      position: relative;
    ">
      📦
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid white;
      "></div>
    </div>`,
    iconSize: [32, 36],
    iconAnchor: [16, 36],
  });
};


export default function RequestMarker({ request }) {
  const { location, resourceType, quantity, urgency, description, status, citizen, createdAt } = request;

  if (!location?.coordinates) return null;

  const [lng, lat] = location.coordinates;

  return (
    <Marker
      position={[lat, lng]}
      icon={createRequestIcon(urgency)}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-bold text-lg text-blue-600 mb-2">
            📦 {resourceType || 'Resource Request'}
          </h3>

          <div className="space-y-1 text-sm">
            <p><strong>Status:</strong>
              <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : status === 'accepted'
                  ? 'bg-blue-100 text-blue-800'
                  : status === 'in_progress'
                  ? 'bg-orange-100 text-orange-800'
                  : status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {status || 'Unknown'}
              </span>
            </p>

            <p><strong>Urgency:</strong>
              <span className={`ml-1 px-2 py-1 rounded text-xs font-medium ${
                urgency?.toLowerCase() === 'critical'
                  ? 'bg-red-100 text-red-800'
                  : urgency?.toLowerCase() === 'high'
                  ? 'bg-orange-100 text-orange-800'
                  : urgency?.toLowerCase() === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {urgency || 'Normal'}
              </span>
            </p>

            {quantity && (
              <p><strong>Quantity:</strong> {quantity}</p>
            )}

            {description && (
              <p><strong>Description:</strong> {description}</p>
            )}

            {citizen && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Requested by:</strong> {citizen.name || 'Anonymous'}
                </p>
                {citizen.phone && (
                  <p className="text-xs text-gray-600">
                    <strong>Phone:</strong> {citizen.phone}
                  </p>
                )}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Requested: {new Date(createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}