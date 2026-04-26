import { FiAlertTriangle, FiCheckCircle, FiClock, FiX } from 'react-icons/fi';

export default function ResourceRequestCard({ request, onAccept, onViewDetails }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <FiAlertTriangle className="text-red-500" />;
      case 'urgent':
        return <FiClock className="text-orange-500" />;
      default:
        return <FiCheckCircle className="text-green-500" />;
    }
  };

  const getResourceIcon = (type) => {
    const icons = {
      food: '🍎',
      water: '💧',
      shelter: '🏘️',
      medical: '⚕️',
      clothing: '👕',
      tools: '🔧',
      fuel: '⛽',
    };
    return icons[type] || '📦';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 border-l-4 border-primary">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getResourceIcon(request.resourceType)}</span>
          <div>
            <h3 className="font-semibold text-gray-800">
              {request.resourceType.charAt(0).toUpperCase() + request.resourceType.slice(1)}
            </h3>
            <p className="text-sm text-gray-500">Qty: {request.quantity}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
          {request.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <p className="text-gray-700 text-sm mb-3">{request.description}</p>

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
        <span>📍 {request.location?.address}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getUrgencyIcon(request.urgency)}
          <span className="text-sm font-medium capitalize">{request.urgency}</span>
        </div>
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition text-sm"
            >
              Details
            </button>
          )}
          {onAccept && request.status === 'pending' && (
            <button
              onClick={onAccept}
              className="px-3 py-1 bg-primary hover:bg-red-600 text-white rounded transition text-sm"
            >
              Accept
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
