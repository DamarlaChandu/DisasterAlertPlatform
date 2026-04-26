import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { alertAPI } from '../services/api';
import DisasterCard from '../components/DisasterCard';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await alertAPI.getReports({ status: filter === 'all' ? '' : filter });
      setReports(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Disaster Reports</h1>
            <p className="text-gray-500">Manage and monitor all reported incidents</p>
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
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <button 
              onClick={fetchReports}
              className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading reports...</p>
          </div>
        ) : reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map(report => (
              <DisasterCard 
                key={report._id} 
                disaster={report} 
                onViewDetails={() => window.location.href = `/disasters/${report._id}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
            <p className="text-gray-500">No reports found matching your criteria.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AdminReports;
