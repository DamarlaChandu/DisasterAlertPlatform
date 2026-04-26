import React from 'react';
import { FiTrendingUp, FiActivity, FiUsers, FiSettings, FiMap, FiLayers, FiDatabase, FiExternalLink } from 'react-icons/fi';
import Button from '../../components/Button';
import DisasterCard from '../../components/DisasterCard';

const AdminDashboard = ({ user, stats, recentDisasters, navigate, loading }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FD] font-poppins pb-20">
      {/* Side Control Bar Stub - Visual decoration */}
      <div className="fixed left-0 top-0 bottom-0 w-20 bg-white border-r border-gray-100 hidden xl:flex flex-col items-center py-32 gap-8 z-30">
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-all"><FiDatabase /></div>
        <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-all"><FiUsers /></div>
        <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-all"><FiLayers /></div>
        <div className="w-10 h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:text-white transition-all" onClick={() => navigate('/admin/settings')}><FiSettings /></div>
      </div>

      <div className="xl:pl-20">
        {/* Command Center Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 text-purple-600 font-bold text-xs uppercase tracking-[0.3em] mb-2">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-ping"></span>
              Central Command Active
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Operation <span className="text-purple-600">Overview.</span></h1>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/admin/live-tracking')}
              className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              <FiMap /> Live Operations
            </button>
            <button 
              onClick={() => navigate('/admin/analytics')}
              className="bg-white text-gray-800 border-2 border-gray-100 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <FiTrendingUp /> Data Analytics
            </button>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-8 py-10">
          {/* Real-time Ticker Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Platform Users</p>
              <p className="text-4xl font-black text-gray-800">{stats.totalUsers || 124}</p>
              <FiUsers className="absolute -right-2 -bottom-2 text-gray-50 text-7xl transition-transform group-hover:scale-110" />
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Active Disasters</p>
              <p className="text-4xl font-black text-red-500">{stats.activeDisasters}</p>
              <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Global Coordination</p>
              <p className="text-4xl font-black text-purple-600">{stats.totalCoordination || 0}</p>
              <FiTrendingUp className="absolute -right-2 -bottom-2 text-gray-50 text-7xl transition-transform group-hover:scale-110" />
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Response Rate</p>
              <p className="text-4xl font-black text-green-500">92%</p>
              <FiActivity className="absolute -right-2 -bottom-2 text-gray-50 text-7xl transition-transform group-hover:scale-110" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Command Feed */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-gray-800 tracking-tight">Active Incident Matrix</h2>
                  <button onClick={() => navigate('/admin/reports')} className="text-sm font-bold text-purple-600 hover:underline">Monitor All Reports →</button>
                </div>
                
                {loading ? (
                  <div className="flex justify-center py-12"><div className="spinner"></div></div>
                ) : recentDisasters.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recentDisasters.map(d => (
                      <DisasterCard key={d._id} disaster={d} onViewDetails={() => navigate(`/disasters/${d._id}`)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
                    <p className="text-gray-400 font-bold">No critical incidents detected in current cycle.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Quick Control Panel */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-[#1A1A2E] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-6">System Controls</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-white bg-opacity-5 rounded-2xl flex items-center justify-between hover:bg-opacity-10 transition-all cursor-pointer group" onClick={() => navigate('/admin/users')}>
                      <div className="flex items-center gap-3">
                        <FiUsers className="text-purple-400" />
                        <span className="text-sm font-medium">User Management</span>
                      </div>
                      <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4 bg-white bg-opacity-5 rounded-2xl flex items-center justify-between hover:bg-opacity-10 transition-all cursor-pointer group" onClick={() => navigate('/admin/settings')}>
                      <div className="flex items-center gap-3">
                        <FiSettings className="text-gray-400" />
                        <span className="text-sm font-medium">Platform Config</span>
                      </div>
                      <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-4 bg-white bg-opacity-5 rounded-2xl flex items-center justify-between hover:bg-opacity-10 transition-all cursor-pointer group" onClick={() => navigate('/admin/analytics')}>
                      <div className="flex items-center gap-3">
                        <FiTrendingUp className="text-green-400" />
                        <span className="text-sm font-medium">Performance Metrics</span>
                      </div>
                      <FiExternalLink className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-purple-600 opacity-20 rounded-full blur-3xl"></div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-black text-gray-800 mb-6">Admin Logs</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">New Volunteer Verified</p>
                      <p className="text-[10px] text-gray-400">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Emergency Broadcast Sent</p>
                      <p className="text-[10px] text-gray-400">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Radius Buffer Updated</p>
                      <p className="text-[10px] text-gray-400">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
