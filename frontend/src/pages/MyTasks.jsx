import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { resourceAPI, alertAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { FiClock, FiMapPin, FiCheckCircle, FiActivity, FiPhone, FiZap, FiAlertCircle } from 'react-icons/fi';
import useGeolocation from '../hooks/useGeolocation';

export default function MyTasks() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState([]);
  const activeTask = tasks.find(t => t.status === 'in_progress' || (t.type === 'disaster' && t.status === 'active'));
  const { location: userLocation, isSharing } = useGeolocation({ 
    trackLive: true,
    userName: user?.name,
    activeRequestId: activeTask?.type === 'request' ? activeTask.details?._id : null,
    citizenId: activeTask?.type === 'request' ? (activeTask.details?.citizenId?._id || activeTask.details?.citizenId) : null
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('accepted');
  const [impactStats, setImpactStats] = useState({
    totalCompleted: 0,
    activeTasks: 0,
    totalResourcesDelivered: 0
  });

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const [responsesRes, disastersRes] = await Promise.all([
        resourceAPI.getMyResponses(),
        alertAPI.getReports({ assignedVolunteer: user._id })
      ]);

      const responses = responsesRes.data.data || [];
      const disasters = disastersRes.data.data || [];

      // Normalize tasks
      const normalizedResponses = responses.map(r => ({
        id: r._id,
        type: 'request',
        status: r.status, // accepted, in_progress, completed
        details: r.requestId,
        original: r
      }));

      const normalizedDisasters = disasters.map(d => ({
        id: d._id,
        type: 'disaster',
        status: d.status === 'resolved' ? 'completed' : 'accepted',
        details: d,
        original: d
      }));

      const allTasks = [...normalizedResponses, ...normalizedDisasters];
      setTasks(allTasks);
      
      // Calculate impact stats
      const completed = allTasks.filter(t => t.status === 'completed');
      setImpactStats({
        totalCompleted: completed.length,
        activeTasks: allTasks.filter(t => t.status === 'accepted' || t.status === 'in_progress').length,
        totalResourcesDelivered: responses
          .filter(r => r.status === 'completed')
          .reduce((acc, r) => acc + (r.requestId?.quantity || 0), 0)
      });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleUpdateStatus = async (taskId, nextStatus, taskType) => {
    try {
      if (taskType === 'disaster') {
        // nextStatus 'completed' means 'resolved' in backend for disasters
        const backendStatus = nextStatus === 'completed' ? 'resolved' : nextStatus;
        await alertAPI.updateReport(taskId, { status: backendStatus });
      } else {
        await resourceAPI.updateStatus(taskId, { status: nextStatus });
      }
      fetchMyTasks();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'accepted') return task.status === 'accepted' || task.status === 'in_progress';
    return task.status === filter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-1 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">My Tasks</h1>
              <p className="text-gray-600">Active assignments you've accepted</p>
            </div>
            
            {isSharing && (
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full border border-green-200 animate-pulse">
                <FiActivity />
                <span className="text-xs font-bold uppercase tracking-wider">Live Tracking Active</span>
              </div>
            )}
          </div>

          {/* Impact Summary Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Impact</p>
              <p className="text-2xl font-bold text-gray-800">{impactStats.totalCompleted} <span className="text-sm font-normal text-gray-500">Tasks</span></p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Resources Delivered</p>
              <p className="text-2xl font-bold text-primary">{impactStats.totalResourcesDelivered} <span className="text-sm font-normal text-gray-500">Units</span></p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Active Now</p>
              <p className="text-2xl font-bold text-yellow-600">{impactStats.activeTasks} <span className="text-sm font-normal text-gray-500">Missions</span></p>
            </div>
          </div>

          <div className="flex gap-4 mb-8 bg-white p-2 rounded-xl shadow-sm w-fit border border-gray-100">
            {['accepted', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                  filter === status
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {status === 'accepted' ? 'ACTIVE TASKS' : 'HISTORY'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-gray-500 font-medium">Syncing your tasks...</p>
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-6">
              {filteredTasks.map((task) => {
                const isDisaster = task.type === 'disaster';
                const details = task.details;
                const distance = userLocation && details?.location?.coordinates
                  ? calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      details.location.coordinates[1],
                      details.location.coordinates[0]
                    )
                  : null;

                return (
                  <div key={task.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-transform hover:scale-[1.01] ${
                    isDisaster ? 'border-indigo-100 ring-1 ring-indigo-50' : 'border-gray-100'
                  }`}>
                    <div className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            {isDisaster ? (
                              <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase flex items-center gap-1">
                                <FiZap size={12} /> PRIMARY MISSION
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                                {details?.resourceType}
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              details?.severity === 'critical' || details?.urgency === 'critical' 
                                ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {details?.severity || details?.urgency}
                            </span>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {isDisaster ? `${details?.disasterType} Incident` : `${details?.quantity} Units Required`}
                          </h3>
                          <p className="text-gray-600 mb-6 line-clamp-2">{details?.description}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                                <FiMapPin size={18} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                                <p className="text-sm text-gray-700 font-medium">{details?.location?.address}</p>
                                {distance !== null && (
                                  <p className="text-xs text-primary font-bold mt-1">
                                    {distance < 1 ? '< 1 km away' : `${distance.toFixed(1)} km away`}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {!isDisaster && (
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg text-gray-400">
                                  <FiPhone size={18} />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 font-bold uppercase">Citizen Contact</p>
                                  <p className="text-sm text-gray-700 font-medium">Available after start</p>
                                </div>
                              </div>
                            )}
                            {isDisaster && (
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-400">
                                  <FiAlertCircle size={18} />
                                </div>
                                <div>
                                  <p className="text-xs text-indigo-400 font-bold uppercase">Incident Status</p>
                                  <p className="text-sm text-indigo-700 font-medium uppercase tracking-wider">{details?.status}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:w-64 flex flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                          {task.status === 'accepted' && (
                            <div className="flex flex-col gap-2 w-full">
                              <Button
                                variant="primary"
                                size="lg"
                                onClick={() => handleUpdateStatus(isDisaster ? task.id : details?._id, isDisaster ? 'completed' : 'in_progress', task.type)}
                                className={`w-full ${isDisaster ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                              >
                                {isDisaster ? '✅ Mark as Resolved' : '🚀 Start Task'}
                              </Button>
                              {!isDisaster && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(details?._id, 'completed', 'request')}
                                  className="w-full text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  ✅ Mark as Completed
                                </Button>
                              )}
                            </div>
                          )}
                          {task.status === 'in_progress' && !isDisaster && (
                            <>
                              <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => handleUpdateStatus(details?._id, 'completed', 'request')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                              >
                                ✅ Complete
                              </Button>
                              <p className="text-[10px] text-center text-gray-400 italic">
                                Your live location is shared while in progress
                              </p>
                            </>
                          )}
                          {task.status === 'completed' && (
                            <div className="text-center text-green-600 font-bold flex flex-col items-center gap-2">
                              <FiCheckCircle size={32} />
                              <span>{isDisaster ? 'INCIDENT RESOLVED' : 'TASK COMPLETED'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FiClock size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Active Tasks</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You don't have any tasks in this category. Head over to available requests to find someone to help.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/available-requests'}
              >
                Browse Requests
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
