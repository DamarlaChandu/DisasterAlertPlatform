import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import ResourceRequestCard from '../components/ResourceRequestCard';
import { resourceAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { socketEmit } from '../socket/socketManager';
import useGeolocation from '../hooks/useGeolocation';

export default function AvailableRequests() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { location: userLocation } = useGeolocation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nearby');

  // Helper to calculate distance (frontend side for immediate sorting)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await resourceAPI.getRequests({ status: 'pending' });
        
        let filtered = (response.data.data || []).map(req => {
          const dist = userLocation && req.location?.coordinates 
            ? calculateDistance(
                userLocation.latitude, 
                userLocation.longitude, 
                req.location.coordinates[1], 
                req.location.coordinates[0]
              )
            : null;
          return { ...req, distance: dist };
        });
        
        if (sortBy === 'urgent') {
          const urgencyOrder = { critical: 0, urgent: 1, normal: 2 };
          filtered.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
        } else if (sortBy === 'recent') {
          filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === 'nearby') {
          filtered.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
        }

        setRequests(filtered);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [sortBy, userLocation]);

  const handleAccept = async (requestId) => {
    try {
      const response = await resourceAPI.acceptRequest(requestId);
      const updatedRequest = response.data.data;

      setRequests((prev) => prev.filter((r) => r._id !== requestId));

      // Emit Socket.io event
      socketEmit('request_accepted', {
        requestId: updatedRequest._id,
        volunteerId: user._id,
        volunteerName: user.name,
        volunteerPhone: user.phone,
        acceptedAt: new Date(),
        citizenId: updatedRequest.citizenId,
      });

      alert('Request accepted! You will now help this person.');
    } catch (error) {
      alert('Failed to accept request: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Available Requests</h1>
            <p className="text-gray-600">Help those in need by accepting resource requests</p>
          </div>

          {/* Controls */}
          <div className="flex gap-4 mb-8 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="nearby">Nearest First</option>
                <option value="urgent">Most Urgent First</option>
                <option value="recent">Most Recent First</option>
              </select>
            </div>
          </div>

          {/* Requests Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading available requests...</div>
            </div>
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <div key={request._id} className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {request.resourceType.charAt(0).toUpperCase() + request.resourceType.slice(1)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500">Quantity: {request.quantity}</p>
                        {request.distance !== null && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {request.distance < 1 ? '< 1 km' : `${request.distance.toFixed(1)} km`} away
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      request.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                      request.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {request.urgency.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-2"><strong>📍 Location:</strong> {request.location?.address}</p>
                  {request.description && (
                    <p className="text-gray-600 text-sm mb-4">{request.description}</p>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-xs text-gray-500 mb-1">Requested by:</p>
                    <p className="font-semibold text-gray-800">{request.citizenId?.name}</p>
                    {request.citizenId?.phone && (
                      <p className="text-sm text-gray-600">{request.citizenId.phone}</p>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    size="full"
                    onClick={() => handleAccept(request._id)}
                  >
                    ✓ Accept Request
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg mb-4">No pending requests available</p>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
