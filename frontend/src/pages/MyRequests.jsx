import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import ResourceRequestCard from '../components/ResourceRequestCard';
import { resourceAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { socketOn, socketOff } from '../socket/socketManager';
import RatingModal from '../components/RatingModal';
import { coordinationAPI } from '../services/api';

export default function MyRequests() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequestForRating, setSelectedRequestForRating] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await resourceAPI.getMyRequests();
        setRequests(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    socketOn('request_accepted', (data) => {
      setRequests((prev) =>
        prev.map((req) =>
          req._id === data.requestId ? { ...req, status: 'accepted' } : req
        )
      );
    });

    socketOn('status_updated', (data) => {
      setRequests((prev) =>
        prev.map((req) =>
          req._id === data.requestId ? { ...req, status: data.status } : req
        )
      );
    });

    return () => {
      socketOff('request_accepted');
      socketOff('status_updated');
    };
  }, []);

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter((req) => req.status === filter);

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Requests</h1>
            <p className="text-gray-600">Track all your resource requests in one place</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {['all', 'pending', 'accepted', 'in_progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status.replace('_', ' ').toUpperCase()} ({statusCounts[status]})
              </button>
            ))}
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Loading your requests...</div>
            </div>
          ) : filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-sm">Resource</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {request.resourceType} x {request.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Location</p>
                      <p className="text-lg font-semibold text-gray-800">{request.location?.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Status</p>
                      <p className={`text-lg font-semibold ${
                        request.status === 'completed' ? 'text-green-600' :
                        request.status === 'accepted' ? 'text-blue-600' :
                        request.status === 'pending' ? 'text-yellow-600' : 'text-gray-600'
                      }`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {request.assignedVolunteer && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-gray-600">
                        Assigned to: <strong>{request.assignedVolunteer.name}</strong>
                      </p>
                      {request.assignedVolunteer.phone && (
                        <p className="text-sm text-gray-600">
                          Phone: <a href={`tel:${request.assignedVolunteer.phone}`} className="text-primary font-semibold hover:underline">
                            {request.assignedVolunteer.phone}
                          </a>
                        </p>
                      )}
                    </div>
                  )}

                  {request.description && (
                    <p className="text-gray-600 mb-4">{request.description}</p>
                  )}

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/requests/${request._id}`}
                    >
                      View Details
                    </Button>
                    {request.status === 'completed' && request.assignedVolunteer && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setSelectedRequestForRating(request)}
                      >
                        🌟 Rate Responder
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 text-lg">No requests found with this status</p>
              {filter !== 'all' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="mt-4"
                >
                  View All Requests
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {selectedRequestForRating && (
        <RatingModal
          isOpen={!!selectedRequestForRating}
          onClose={() => setSelectedRequestForRating(null)}
          volunteerName={selectedRequestForRating.assignedVolunteer?.name}
          onSubmit={async (data) => {
            // responseId is usually required, but here we might need to find it from the request
            // or pass the requestId if the backend supports it. 
            // In your backend architecture, ratings are often on the 'Response/Task'
            // For now, let's assume we can rate via requestId or handle the error
            try {
              await coordinationAPI.rateVolunteer(selectedRequestForRating._id, data);
              alert('Thank you for your feedback!');
            } catch (err) {
              console.error(err);
              alert('Failed to submit rating. Please try again later.');
            }
          }}
        />
      )}
    </div>
  );
}
