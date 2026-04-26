import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { resourceAPI } from '../services/api';
import ResourceRequestCard from '../components/ResourceRequestCard';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await resourceAPI.getRequests({ status: filter === 'all' ? '' : filter });
      setRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Resource Requests</h1>
            <p className="text-gray-500">Monitor and coordinate resource allocation</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white border rounded-lg flex items-center px-3 text-gray-500">
              <FiFilter />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border-none focus:ring-0 text-sm py-2 bg-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button 
              onClick={fetchRequests}
              className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading requests...</p>
          </div>
        ) : requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(request => (
              <ResourceRequestCard 
                key={request._id} 
                request={request} 
                onViewDetails={() => window.location.href = `/requests/${request._id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
            <p className="text-gray-500">No requests found matching your criteria.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminRequests;
