import { FiAlertTriangle, FiMapPin } from 'react-icons/fi';

export default function DisasterCard({ disaster, onViewDetails }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDisasterIcon = (type) => {
    const icons = {
      flood: '🌊',
      earthquake: '🏚️',
      cyclone: '🌀',
      fire: '🔥',
      landslide: '⛏️',
      storm: '⛈️',
      other: '⚠️',
    };
    return icons[type] || '⚠️';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 border-l-4 border-primary ${getSeverityColor(disaster.severity)}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getDisasterIcon(disaster.disasterType)}</span>
          <div>
            <h3 className="font-semibold text-gray-800">
              {disaster.disasterType.toUpperCase()}
            </h3>
            <p className="text-xs text-gray-500">
              {new Date(disaster.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(disaster.severity)}`}>
          {disaster.severity.toUpperCase()}
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{disaster.description}</p>

      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
        <FiMapPin size={16} />
        <span>{disaster.location?.address}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {disaster.resourcesNeeded?.map((resource) => (
            <span key={resource} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
              {resource}
            </span>
          ))}
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="px-3 py-1 bg-primary hover:bg-red-600 text-white rounded transition text-sm"
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
}
