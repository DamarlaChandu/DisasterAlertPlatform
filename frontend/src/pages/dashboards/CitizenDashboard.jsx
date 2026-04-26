import React from 'react';
import { FiAlertTriangle, FiPlusCircle, FiMap, FiClock, FiCheckCircle, FiShield } from 'react-icons/fi';
import Button from '../../components/Button';
import DisasterCard from '../../components/DisasterCard';
import ResourceRequestCard from '../../components/ResourceRequestCard';

const CitizenDashboard = ({ user, stats, recentDisasters, recentRequests, navigate, loading }) => {
  return (
    <div className="min-h-screen bg-[#FFFBF9] font-poppins pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#FF8C61] to-[#FF5E62] pt-16 pb-20 px-4 rounded-b-[2rem] shadow-2xl relative overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-orange-200 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest mb-6 border border-white border-opacity-30">
            <FiShield className="text-white" /> Stay Safe, Stay Informed
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            Protect Your <br/> <span className="text-orange-200">Community.</span>
          </h1>
          <p className="text-white text-opacity-90 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Report incidents instantly and request essential resources for your neighborhood. 
            We are here to help you coordinate during emergencies.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/report')}
              className="group bg-white text-[#FF5E62] px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-orange-300 hover:-translate-y-1 transition-all flex items-center gap-3"
            >
              <FiAlertTriangle className="group-hover:animate-bounce" /> Report Disaster
            </button>
            <button 
              onClick={() => navigate('/request-resource')}
              className="bg-[#FF8C61] text-white border-2 border-white border-opacity-50 px-8 py-4 rounded-2xl font-black text-lg hover:bg-opacity-90 transition-all flex items-center gap-3"
            >
              <FiPlusCircle /> Request Resources
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {/* Quick Stats Overlay */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6 border border-gray-100 hover:border-orange-200 transition-colors group">
            <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center text-red-500 text-3xl group-hover:scale-110 transition-transform">
              <FiAlertTriangle />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Active Threats</p>
              <p className="text-4xl font-black text-gray-800">{stats.activeDisasters}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6 border border-gray-100 hover:border-orange-200 transition-colors group">
            <div className="w-16 h-16 bg-orange-100 rounded-3xl flex items-center justify-center text-orange-500 text-3xl group-hover:scale-110 transition-transform">
              <FiClock />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Global Needs</p>
              <p className="text-4xl font-black text-gray-800">{stats.pendingRequests}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl flex items-center gap-6 border border-gray-100 hover:border-orange-200 transition-colors group">
            <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-500 text-3xl group-hover:scale-110 transition-transform">
              <FiCheckCircle />
            </div>
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Help Nearby</p>
              <p className="text-4xl font-black text-gray-800">Active</p>
            </div>
          </div>
        </div>

        {/* Recent Updates Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-800">Nearby Incidents</h2>
                <p className="text-gray-400 mt-2 font-medium">Verified reports from your local area</p>
              </div>
              <button onClick={() => navigate('/map')} className="text-orange-600 font-bold hover:underline flex items-center gap-2">
                <FiMap /> Live Map
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-20"><div className="spinner"></div></div>
            ) : recentDisasters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recentDisasters.map(d => (
                  <DisasterCard key={d._id} disaster={d} onViewDetails={() => navigate(`/disasters/${d._id}`)} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed rounded-[2rem] py-20 text-center">
                <p className="text-gray-400 font-bold">No active incidents reported in your zone.</p>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-black text-gray-800 mb-6">Your Requests</h2>
              <div className="bg-white rounded-[2rem] shadow-lg p-6 border border-gray-100">
                {recentRequests.length > 0 ? (
                  <div className="space-y-4">
                    {recentRequests.slice(0, 3).map(r => (
                      <ResourceRequestCard key={r._id} request={r} onViewDetails={() => navigate(`/requests/${r._id}`)} />
                    ))}
                    <button onClick={() => navigate('/requests')} className="w-full py-4 text-center text-gray-500 font-bold text-sm hover:text-orange-600 transition-colors">
                      View All Requests
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-400 text-sm">No recent resource requests.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-4">Emergency Kit</h3>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                  Have you prepared your emergency kit? Make sure to include water, non-perishable food, and medical supplies.
                </p>
                <button className="bg-white text-indigo-600 px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors">
                  Get Checklist
                </button>
              </div>
              <FiShield className="absolute -right-4 -bottom-4 text-white opacity-10 text-9xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
