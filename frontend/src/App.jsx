import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './context/store';
import { initializeSocket, disconnectSocket, socketOn, socketOff } from './socket/socketManager';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { subscribeToPushNotifications } from './utils/pushNotification';


// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportDisaster from './pages/ReportDisaster';
import RequestResource from './pages/RequestResource';
import MyRequests from './pages/MyRequests';
import AvailableRequests from './pages/AvailableRequests';
import MyTasks from './pages/MyTasks';
import Analytics from './pages/Analytics';
import Map from './pages/Map';
import AdminLiveTracking from './pages/AdminLiveTracking';
import Settings from './pages/Settings';
import AdminReports from './pages/AdminReports';
import AdminRequests from './pages/AdminRequests';
import Users from './pages/Users';
import DisasterDetails from './pages/DisasterDetails';
import RequestDetails from './pages/RequestDetails';

// CSS
import './index.css';

function ProtectedRoute({ children, requiredRole = null }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default function App() {
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      initializeSocket(token);
      
      // Subscribe to browser push notifications
      subscribeToPushNotifications();

      // Handle global emergency broadcasts
      socketOn('disaster_alert', (data) => {
        toast.error(`🚨 NEW DISASTER: ${data.disasterType}`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      });

      socketOn('incident:nearby', (data) => {
        toast.warning(`🔔 NEARBY INCIDENT: ${data.message}`, {
          position: "top-right",
          autoClose: 5000,
        });
      });

      // Handle new resource requests (strictly for volunteers)
      if (user?.role === 'volunteer') {
        socketOn('new_request', (data) => {
          toast.info(`📦 NEW REQUEST: ${data.resourceType} needed nearby!`, {
            position: "top-right",
            autoClose: 10000,
            onClick: () => window.location.href = `/requests/${data.requestId}`
          });
        });
      }

    }

    return () => {
      if (!token) {
        disconnectSocket();
      }
      socketOff('disaster_alert');
      socketOff('incident:nearby');
      socketOff('new_request');
    };

  }, [token, user]);

  return (
    <Router>
      <ToastContainer />
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={<Map />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Citizen Routes */}
        <Route
          path="/report"
          element={
            <ProtectedRoute requiredRole="citizen">
              <ReportDisaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/request-resource"
          element={
            <ProtectedRoute requiredRole="citizen">
              <RequestResource />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute requiredRole="citizen">
              <MyRequests />
            </ProtectedRoute>
          }
        />

        {/* Volunteer Routes */}
        <Route
          path="/available-requests"
          element={
            <ProtectedRoute requiredRole="volunteer">
              <AvailableRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <ProtectedRoute requiredRole="volunteer">
              <MyTasks />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/live-tracking"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLiveTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          }
        />

        {/* Detail Routes */}
        <Route
          path="/disasters/:id"
          element={
            <ProtectedRoute>
              <DisasterDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute>
              <RequestDetails />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
