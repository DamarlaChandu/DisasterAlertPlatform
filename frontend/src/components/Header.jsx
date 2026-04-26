import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/store';
import NotificationBell from './NotificationBell';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' },
      ];
    }

    const baseLinks = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Map', path: '/map' },
    ];

    if (user.role === 'citizen') {
      return [
        ...baseLinks,
        { name: 'Report Disaster', path: '/report' },
        { name: 'My Requests', path: '/requests' },
      ];
    }

    if (user.role === 'volunteer') {
      return [
        ...baseLinks,
        { name: 'Available Requests', path: '/available-requests' },
        { name: 'My Tasks', path: '/my-tasks' },
      ];
    }

    if (user.role === 'admin') {
      return [
        ...baseLinks,
        { name: 'All Reports', path: '/admin/reports' },
        { name: 'All Requests', path: '/admin/requests' },
        { name: 'Analytics', path: '/admin/analytics' },
        { name: 'Users', path: '/admin/users' },
      ];
    }

    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform hover:scale-105 ${
              user?.role === 'admin' ? 'bg-indigo-600' :
              user?.role === 'volunteer' ? 'bg-blue-600' :
              user?.role === 'citizen' ? 'bg-orange-500' : 'bg-red-500'
            }`}>
              DA
            </div>
            <span className="font-bold text-lg text-gray-800 hidden sm:inline">
              Disaster Alert
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-600 hover:text-primary transition font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {user && <NotificationBell />}

            {user && (
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
                    <FiUser className="text-primary" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-primary transition"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <div className="pt-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 rounded transition"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
