import React from 'react';
import { FiActivity, FiMapPin, FiCheckCircle, FiClock, FiTarget, FiZap, FiRadio } from 'react-icons/fi';
import Button from '../../components/Button';
import DisasterCard from '../../components/DisasterCard';
import ResourceRequestCard from '../../components/ResourceRequestCard';
import LocationSharingToggle from '../../components/LocationSharingToggle';

const VolunteerDashboard = ({ user, stats, recentRequests, recentDisasters, navigate, loading }) => {
  return (
    <div className="min-h-screen bg-[#F5F7FB] font-poppins pb-20">
      {/* Header Mesh Section */}
      <div className="bg-[#1A1A2E] pt-16 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4F46E5 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600 opacity-20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-blue-500 opacity-20 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500 bg-opacity-20 rounded-full text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] border border-indigo-500 border-opacity-30 mb-6">
                <FiRadio className="animate-pulse" /> Operational Status: Active
              </div>
              <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                Mission <span className="text-indigo-400">Control.</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Ready to deploy? Your role as a responder is critical to community resilience. 
                Accept requests and coordinate real-time assistance.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white border-opacity-10 shadow-2xl min-w-[320px]">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Active Missions</span>
                <FiTarget className="text-indigo-400" />
              </div>
              <div className="flex items-end gap-3 mb-2">
                <span className="text-5xl font-black text-white leading-none">{stats.myTasks}</span>
                <span className="text-gray-500 font-bold text-sm mb-1">Ongoing</span>
              </div>
              <div className="w-full bg-white bg-opacity-10 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((stats.completedTasks / (stats.myTasks + stats.completedTasks || 1)) * 100, 100)}%` }}></div>
              </div>
              <p className="text-[10px] text-gray-500 mt-3 font-bold uppercase tracking-widest">Success Rate: {Math.round((stats.completedTasks / (stats.myTasks + stats.completedTasks || 1)) * 100)}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {/* Action Blocks */}
          <div className="lg:col-span-1 space-y-6">
            <button 
              onClick={() => navigate('/available-requests')}
              className="w-full bg-white group hover:bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl transition-all duration-300 text-left border border-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-indigo-100 group-hover:bg-indigo-500 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:text-white mb-6 transition-colors">
                  <FiZap size={24} />
                </div>
                <h3 className="font-black text-gray-800 group-hover:text-white text-xl mb-2 transition-colors">Find Missions</h3>
                <p className="text-sm text-gray-500 group-hover:text-indigo-200 transition-colors">Accept nearby resource requests in real-time.</p>
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-24 h-24 bg-indigo-500 opacity-0 group-hover:opacity-20 rounded-full blur-2xl transition-opacity"></div>
            </button>

            <button 
              onClick={() => navigate('/my-tasks')}
              className="w-full bg-white group hover:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl transition-all duration-300 text-left border border-white"
            >
              <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-white mb-6 transition-colors">
                <FiCheckCircle size={24} />
              </div>
              <h3 className="font-black text-gray-800 group-hover:text-white text-xl mb-2 transition-colors">My History</h3>
              <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">Track your impact and completed assignments.</p>
            </button>
          </div>

          <div className="lg:col-span-3 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <span className="w-2 h-8 bg-red-500 rounded-full"></span>
                    Active Disasters
                  </h2>
                  <button onClick={() => navigate('/map')} className="text-sm font-bold text-red-600 hover:underline">Monitor on Map →</button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12"><div className="spinner"></div></div>
                ) : recentDisasters?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentDisasters.map(d => (
                      <DisasterCard key={d._id} disaster={d} onViewDetails={() => navigate(`/disasters/${d._id}`)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed">
                    <p className="text-gray-400 font-bold">No active disaster reports in your zone.</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                    Tactical Feed (Requests)
                  </h2>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase">{stats.pendingRequests} Global Alerts</span>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center py-12"><div className="spinner"></div></div>
                ) : recentRequests.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentRequests.map(r => (
                      <ResourceRequestCard key={r._id} request={r} onViewDetails={() => navigate(`/requests/${r._id}`)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed">
                    <FiActivity className="mx-auto text-gray-300 text-5xl mb-4" />
                    <p className="text-gray-400 font-bold">Scanning for new resource requests...</p>
                  </div>
                )}
              </div>

            <div className="transform scale-105 origin-center">
              <LocationSharingToggle />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
