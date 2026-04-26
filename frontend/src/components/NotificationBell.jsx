import React, { useState, useEffect, useRef } from 'react';
import { FiBell, FiAlertTriangle, FiCheckCircle, FiInfo, FiTrash2, FiX } from 'react-icons/fi';
import { socketOn } from '../socket/socketManager';
import { useAuthStore, useNotificationStore } from '../context/store';

export default function NotificationBell() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, markAsRead, removeNotification, addNotification, clearNotifications } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Sync socket events with global notification store
    const handleDisaster = (data) => {
      addNotification({
        id: Date.now(),
        type: 'disaster',
        title: '🚨 NEW DISASTER',
        message: `${data.disasterType} reported at ${data.location?.address || 'nearby'}`,
        unread: true,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    const handleRequest = (data) => {
      addNotification({
        id: Date.now(),
        type: 'request',
        title: '📦 NEW REQUEST',
        message: `New resource request for ${data.resourceType}`,
        unread: true,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    socketOn('disaster_alert', handleDisaster);
    socketOn('new_request', handleRequest);

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Toggle */}
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) markAsRead();
        }}
        className="relative p-2 rounded-full hover:bg-indigo-50 transition-all text-gray-600 hover:text-indigo-600 focus:outline-none group"
      >
        <FiBell size={22} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-bounce shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in duration-200">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h3 className="font-black text-gray-900 text-sm tracking-tight uppercase">Activity Center</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearNotifications}
                className="text-[10px] font-black text-gray-400 hover:text-red-500 flex items-center gap-1 uppercase tracking-widest transition-colors"
              >
                <FiTrash2 /> Clear
              </button>
            )}
          </div>

          <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-5 hover:bg-indigo-50/30 transition-colors cursor-pointer group relative ${n.unread ? 'bg-indigo-50/10' : ''}`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center shrink-0 shadow-sm ${
                        n.type === 'disaster' ? 'bg-red-100 text-red-600' : 
                        n.type === 'request' ? 'bg-blue-100 text-blue-600' : 
                        'bg-indigo-100 text-indigo-600'
                      }`}>
                        {n.type === 'disaster' ? <FiAlertTriangle /> : 
                         n.type === 'request' ? <FiCheckCircle /> : <FiInfo />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tighter">{n.title}</p>
                          <span className="text-[10px] text-gray-400 font-bold">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                          {n.message}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(n.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                    {n.unread && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.6)]"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <FiBell className="text-gray-300 text-2xl" />
                </div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Alerts</p>
                <p className="text-xs text-gray-300 mt-1">Your sector is currently stable.</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50">
              <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-[0.2em]">
                View System Logs
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
