import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { alertAPI } from '../services/api';
import { FiMapPin, FiCalendar, FiAlertCircle, FiActivity, FiLayers, FiZap, FiCheckCircle } from 'react-icons/fi';
import { useAuthStore } from '../context/store';

const DisasterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDisaster = async () => {
      try {
        setLoading(true);
        const res = await alertAPI.getReportById(id);
        setDisaster(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDisaster();
  }, [id]);

  const handleAcceptMission = async () => {
    try {
      setUpdating(true);
      await alertAPI.acceptDisasterMission(id);
      // Refresh
      const res = await alertAPI.getReportById(id);
      setDisaster(res.data.data);
      alert('Mission accepted! You are now assigned to this incident.');
    } catch (err) {
      console.error('Accept mission error:', err);
      const message = err.response?.data?.message || 'Failed to accept mission';
      alert(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    try {
      setUpdating(true);
      await alertAPI.updateReport(id, { status: 'resolved' });
      // Refresh
      const res = await alertAPI.getReportById(id);
      setDisaster(res.data.data);
    } catch (err) {
      alert('Failed to resolve incident');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!disaster) return <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <p>Disaster report not found.</p>
    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
  </div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className={`p-8 text-white ${
              disaster.severity === 'critical' ? 'bg-red-600' : 
              disaster.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
            }`}>
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1 bg-white bg-opacity-20 rounded-full text-sm font-bold uppercase tracking-widest border border-white border-opacity-30">
                  {disaster.severity} Incident
                </span>
                <span className="text-4xl">
                  {disaster.disasterType === 'flood' ? '🌊' : 
                   disaster.disasterType === 'earthquake' ? '🏚️' : '⚠️'}
                </span>
              </div>
              <h1 className="text-4xl font-bold mb-2 capitalize">{disaster.disasterType} Report</h1>
              <div className="flex items-center gap-2 text-white text-opacity-80">
                <FiCalendar /> 
                <span>{new Date(disaster.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-8 md:p-12 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{disaster.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location Information</h3>
                    <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">
                      <FiMapPin className="text-primary mt-1" />
                      <div>
                        <p className="font-bold text-gray-800">{disaster.location?.address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Coordinates: {disaster.location?.coordinates?.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Status & Impact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <FiActivity className="text-blue-600 mb-2" />
                        <p className="text-xs text-blue-600 font-bold uppercase">Status</p>
                        <p className="text-lg font-bold text-blue-800 capitalize">{disaster.status}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                        <FiLayers className="text-purple-600 mb-2" />
                        <p className="text-xs text-purple-600 font-bold uppercase">Affected Areas</p>
                        <p className="text-lg font-bold text-purple-800">1+ Major Zones</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Resources Needed</h3>
                    <div className="flex flex-wrap gap-2">
                      {disaster.resourcesNeeded?.map(res => (
                        <span key={res} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold capitalize">
                          {res}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-8 border-t flex flex-wrap gap-4 justify-between items-center">
                <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
                <div className="flex gap-3">
                  {user?.role === 'admin' && disaster.status === 'active' && (
                    <Button 
                      variant="primary" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      loading={updating}
                      onClick={handleResolve}
                    >
                      ✅ Resolve Incident
                    </Button>
                  )}
                  {user?.role === 'volunteer' && disaster.status === 'active' && !disaster.assignedVolunteer && (
                    <Button 
                      variant="primary" 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      loading={updating}
                      onClick={handleAcceptMission}
                    >
                      <FiZap className="inline mr-2" /> Accept Mission
                    </Button>
                  )}
                  {user?.role === 'volunteer' && disaster.assignedVolunteer === user._id && disaster.status === 'active' && (
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm">
                        <FiCheckCircle /> Mission Active
                      </div>
                      <Button 
                        variant="primary" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        loading={updating}
                        onClick={handleResolve}
                      >
                        ✅ Mark as Completed
                      </Button>
                    </div>
                  )}
                  {user?.role === 'volunteer' && disaster.assignedVolunteer === user._id && disaster.status === 'resolved' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-sm">
                      <FiCheckCircle /> Mission Accomplished
                    </div>
                  )}
                  <Button variant="primary" onClick={() => navigate('/request-resource')}>
                    Request Assistance
                  </Button>
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

export default DisasterDetails;
