import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiAlertTriangle, FiCheckCircle, FiInfo, FiTrash2 } from 'react-icons/fi';
import { socketOn } from '../socket/socketManager';

const NotificationDropdown = ({ user }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 'welcome',
      type: 'info',
      title: 'Welcome to Disaster Alert',
      message: `You are logged in as ${user?.role}. Stay safe!`,
      time: 'Just now',
      unread: true
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    // Listen for real-time alerts
    socketOn('disaster_alert', (data) => {
      const newNotif = {
        id: Date.now(),
        type: 'disaster',
        title: '🚨 NEW DISASTER',
        message: `${data.disasterType} reported at ${data.location?.address || 'nearby'}`,
        time: 'Just now',
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);
    });

    socketOn('new_request', (data) => {
      const newNotif = {
        id: Date.now(),
        type: 'request',
        title: '📦 NEW REQUEST',
        message: `New resource request for ${data.resourceType}`,
        time: 'Just now',
        unread: true
      };
      setNotifications(prev => [newNotif, ...prev]);
    });

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Toggle */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAsRead();
        }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-all text-gray-600 hover:text-indigo-600 focus:outline-none"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-gray-800 text-sm tracking-tight">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearNotifications}
                className="text-[10px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest transition-colors"
              >
                <FiTrash2 /> Clear All
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 border-b border-gray-50 hover:bg-indigo-50/30 transition-colors cursor-pointer group ${n.unread ? 'bg-indigo-50/10' : ''}`}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      n.type === 'disaster' ? 'bg-red-100 text-red-600' : 
                      n.type === 'request' ? 'bg-blue-100 text-blue-600' : 
                      'bg-indigo-100 text-indigo-600'
                    }`}>
                      {n.type === 'disaster' ? <FiAlertTriangle /> : 
                       n.type === 'request' ? <FiCheckCircle /> : <FiInfo />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-black text-gray-800 truncate">{n.title}</p>
                        <span className="text-[10px] text-gray-400 font-medium">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                    {n.unread && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1 shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiBell className="text-gray-300 text-2xl" />
                </div>
                <p className="text-sm font-bold text-gray-400">All caught up!</p>
                <p className="text-xs text-gray-300 mt-1">No new notifications for you.</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 bg-gray-50 text-center">
              <button className="text-xs font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest">
                View All Activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
