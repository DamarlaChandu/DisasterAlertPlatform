import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertAPI, resourceAPI, profileAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { socketOn, socketOff } from '../socket/socketManager';
import CitizenDashboard from './dashboards/CitizenDashboard';
import VolunteerDashboard from './dashboards/VolunteerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDisasters: 0,
    pendingRequests: 0,
    myTasks: 0,
    completedTasks: 0,
    totalUsers: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentDisasters, setRecentDisasters] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [disasterRes, requestRes] = await Promise.all([
          alertAPI.getReports({ status: 'active' }),
          resourceAPI.getRequests({ status: 'pending' }),
        ]);

        let extraStats = {};
        if (user?.role === 'volunteer') {
          const [volunteerStats, disasterMissions] = await Promise.all([
            resourceAPI.getMyResponses(),
            alertAPI.getReports({ assignedVolunteer: user._id })
          ]);
          
          const tasks = volunteerStats.data.data || [];
          const missions = disasterMissions.data.data || [];
          
          extraStats = {
            myTasks: tasks.filter(t => t.status !== 'completed').length + 
                     missions.filter(m => m.status === 'active').length,
            completedTasks: tasks.filter(t => t.status === 'completed').length +
                            missions.filter(m => m.status !== 'active').length
          };
        } else if (user?.role === 'admin') {
          const [adminStats, usersRes] = await Promise.all([
            resourceAPI.getCoordinationStatus(),
            profileAPI.getAllUsers()
          ]);
          extraStats = {
            totalCoordination: adminStats.data.data.total,
            totalUsers: usersRes.data.data.length
          };
        }

        setStats(prev => ({
          ...prev,
          activeDisasters: disasterRes.data.count || 0,
          pendingRequests: requestRes.data.count || 0,
          ...extraStats
        }));

        setRecentDisasters(disasterRes.data.data?.slice(0, 5) || []);
        setRecentRequests(requestRes.data.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Listen to real-time updates
    socketOn('new_request', (data) => {
      setRecentRequests((prev) => [data, ...prev].slice(0, 5));
      setStats((prev) => ({ ...prev, pendingRequests: prev.pendingRequests + 1 }));
    });

    socketOn('disaster_alert', (data) => {
      setRecentDisasters((prev) => [data, ...prev].slice(0, 5));
      setStats((prev) => ({ ...prev, activeDisasters: prev.activeDisasters + 1 }));
    });

    return () => {
      socketOff('new_request');
      socketOff('disaster_alert');
    };
  }, [user]);

  // Handle common layout wrappers inside the specific dashboards
  // but if loading and no dashboard yet, show simple loader
  if (loading && !recentDisasters.length && !recentRequests.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="spinner"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (user?.role === 'admin') {
    return (
      <>
        <Header />
        <AdminDashboard 
          user={user} 
          stats={stats} 
          recentDisasters={recentDisasters} 
          navigate={navigate} 
          loading={loading} 
        />
        <Footer />
      </>
    );
  }

  if (user?.role === 'volunteer') {
    return (
      <>
        <Header />
        <VolunteerDashboard 
          user={user} 
          stats={stats} 
          recentRequests={recentRequests} 
          recentDisasters={recentDisasters}
          navigate={navigate} 
          loading={loading} 
        />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <CitizenDashboard 
        user={user} 
        stats={stats} 
        recentDisasters={recentDisasters} 
        recentRequests={recentRequests} 
        navigate={navigate} 
        loading={loading} 
      />
      <Footer />
    </>
  );
}
