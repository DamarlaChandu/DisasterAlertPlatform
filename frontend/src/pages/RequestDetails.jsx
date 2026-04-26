import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { resourceAPI } from '../services/api';
import { FiPackage, FiMapPin, FiUser, FiInfo, FiClock, FiCheckCircle } from 'react-icons/fi';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../context/store';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        setLoading(true);
        const res = await resourceAPI.getRequestById(id);
        setRequest(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequest();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await resourceAPI.updateStatus(id, { status: newStatus });
      // Refresh data
      const res = await resourceAPI.getRequestById(id);
      setRequest(res.data.data);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!request) return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <p>Resource request not found.</p>
    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
  </div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={`p-8 text-white ${
              request.status === 'completed' ? 'bg-green-600' : 
              request.status === 'in_progress' ? 'bg-blue-600' : 
              request.status === 'accepted' ? 'bg-indigo-600' : 'bg-yellow-500'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1 bg-white bg-opacity-20 rounded-full text-sm font-bold uppercase tracking-widest border border-white border-opacity-30">
                  {request.status.replace('_', ' ')}
                </span>
                <FiPackage size={40} className="text-white text-opacity-50" />
              </div>
              <h1 className="text-4xl font-bold mb-2 capitalize">{request.resourceType} Request</h1>
              <div className="flex items-center gap-2 text-white text-opacity-80">
                <FiClock /> 
                <span>Requested on {new Date(request.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Item Details</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold text-gray-800">{request.quantity}</div>
                      <div className="text-gray-500 uppercase tracking-widest text-sm font-bold">Units of {request.resourceType}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-2xl italic">"{request.description || 'No additional description provided.'}"</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Delivery Location</h3>
                    <div className="flex items-start gap-3">
                      <FiMapPin className="text-primary mt-1" />
                      <p className="font-bold text-gray-800">{request.location?.address}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 border-b pb-4">Responder Information</h3>
                    {request.assignedVolunteer ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                            {request.assignedVolunteer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-lg">{request.assignedVolunteer.name}</p>
                            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Verified Responder</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 flex items-center gap-2"><FiUser /> {request.assignedVolunteer.email}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-2 font-bold underline"><FiPackage /> Call: {request.assignedVolunteer.phone || 'N/A'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                          <FiUser size={24} />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Searching for available responders nearby...</p>
                        <div className="mt-4 flex justify-center">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {request.status === 'completed' && (
                    <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-start gap-4">
                      <FiCheckCircle className="text-green-600 mt-1 text-xl" />
                      <div>
                        <p className="font-bold text-green-800">Mission Accomplished</p>
                        <p className="text-xs text-green-700">This request has been successfully fulfilled. Thank you for using the platform.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t flex flex-wrap gap-4 justify-between items-center">
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                
                <div className="flex gap-3">
                  {/* Volunteer Actions */}
                  {request.status === 'accepted' && request.assignedVolunteer?._id === user?._id && (
                    <Button 
                      variant="primary" 
                      loading={updating}
                      onClick={() => handleStatusUpdate('in_progress')}
                    >
                      🚀 Start Task
                    </Button>
                  )}
                  
                  {request.status === 'in_progress' && request.assignedVolunteer?._id === user?._id && (
                    <Button 
                      variant="primary" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      loading={updating}
                      onClick={() => handleStatusUpdate('completed')}
                    >
                      ✅ Mark as Completed
                    </Button>
                  )}

                  {/* Admin Actions */}
                  {user?.role === 'admin' && request.status !== 'completed' && request.status !== 'cancelled' && (
                    <Button 
                      variant="secondary"
                      className="bg-green-100 text-green-700 border-green-200"
                      loading={updating}
                      onClick={() => handleStatusUpdate('completed')}
                    >
                      Force Complete (Admin)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RequestDetails;
