import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { alertAPI, resourceAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    reqByType: {},
    reqByStatus: {},
    disasterByType: {},
    disasterBySeverity: {},
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [resourceRes, alertRes] = await Promise.all([
          resourceAPI.getRequests({}),
          alertAPI.getReports({}),
        ]);

        const requests = resourceRes.data.data || [];
        const disasters = alertRes.data.data || [];

        // Calculate stats
        const completed = requests.filter((r) => r.status === 'completed').length;
        const pending = requests.filter((r) => r.status === 'pending').length;

        // Count by type
        const reqByType = {};
        requests.forEach((req) => {
          reqByType[req.resourceType] = (reqByType[req.resourceType] || 0) + 1;
        });

        // Count by status
        const reqByStatus = {};
        requests.forEach((req) => {
          reqByStatus[req.status] = (reqByStatus[req.status] || 0) + 1;
        });

        // Count disasters by type
        const disasterByType = {};
        disasters.forEach((d) => {
          disasterByType[d.disasterType] = (disasterByType[d.disasterType] || 0) + 1;
        });

        // Count disasters by severity
        const disasterBySeverity = {};
        disasters.forEach((d) => {
          disasterBySeverity[d.severity] = (disasterBySeverity[d.severity] || 0) + 1;
        });

        setStats({
          totalRequests: requests.length,
          completedRequests: completed,
          pendingRequests: pending,
          totalDisasters: disasters.filter(d => d.status === 'active').length,
          reqByType,
          reqByStatus,
          disasterByType,
          disasterBySeverity,
        });
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, navigate]);

  const COLORS = ['#EF4444', '#F97316', '#06B6D4', '#10B981', '#8B5CF6'];

  const requestTypeData = Object.entries(stats.reqByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const requestStatusData = Object.entries(stats.reqByStatus).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count,
  }));

  const disasterTypeData = Object.entries(stats.disasterByType).map(([type, count]) => ({
    name: type,
    value: count,
  }));

  const disasterSeverityData = Object.entries(stats.disasterBySeverity).map(([severity, count]) => ({
    name: severity,
    value: count,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Total Requests</p>
              <p className="text-4xl font-bold text-primary">{stats.totalRequests}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Completed</p>
              <p className="text-4xl font-bold text-green-600">{stats.completedRequests}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Pending</p>
              <p className="text-4xl font-bold text-yellow-600">{stats.pendingRequests}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600 text-sm mb-2">Active Disasters</p>
              <p className="text-4xl font-bold text-red-600">{stats.totalDisasters || 0}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Requests by Type */}
            {requestTypeData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Requests by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={requestTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {requestTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Requests by Status */}
            {requestStatusData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Requests by Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={requestStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Disasters by Type */}
            {disasterTypeData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Disasters by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={disasterTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {disasterTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Disasters by Severity */}
            {disasterSeverityData.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Disasters by Severity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={disasterSeverityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
