import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { profileAPI } from '../services/api';
import { FiSettings, FiGlobe, FiPhone, FiInfo, FiLock } from 'react-icons/fi';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    platformName: 'DisasterAlert Platform',
    emergencyContact: '+91 1234567890',
    broadcastRadius: 10,
    allowGuestReporting: false,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call for settings
    setTimeout(() => {
      setLoading(false);
      alert('Settings updated successfully!');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary rounded-2xl text-white shadow-lg">
              <FiSettings size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Platform Settings</h1>
              <p className="text-gray-500">Manage global configurations and content</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-gray-50 border-r p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'general' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <FiGlobe /> General
                </button>
                <button
                  onClick={() => setActiveTab('emergency')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'emergency' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <FiPhone /> Emergency
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'security' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <FiLock /> Security
                </button>
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 md:p-10">
              {activeTab === 'general' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">General Configuration</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Platform Name</label>
                    <input 
                      type="text" 
                      value={settings.platformName}
                      onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Default Broadcast Radius (KM)</label>
                    <input 
                      type="number" 
                      value={settings.broadcastRadius}
                      onChange={(e) => setSettings({...settings, broadcastRadius: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-gray-700"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'emergency' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">Emergency Contact Info</h3>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Helpline</label>
                    <input 
                      type="text" 
                      value={settings.emergencyContact}
                      onChange={(e) => setSettings({...settings, emergencyContact: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary text-gray-700"
                    />
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700">
                    <FiInfo className="mt-1 flex-shrink-0" />
                    <p className="text-xs">This number will be displayed globally on all citizen dashboards and public pages during active disasters.</p>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-4">Security & Access</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-800">Allow Guest Reporting</p>
                      <p className="text-xs text-gray-500">Enable users to report incidents without logging in</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.allowGuestReporting}
                      onChange={(e) => setSettings({...settings, allowGuestReporting: e.target.checked})}
                      className="w-5 h-5 rounded text-primary focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                    <div>
                      <p className="font-bold text-red-800">Maintenance Mode</p>
                      <p className="text-xs text-red-500">Put the platform in read-only mode for maintenance</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                      className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              <div className="mt-10 pt-6 border-t flex justify-end">
                <Button
                  variant="primary"
                  size="lg"
                  loading={loading}
                  onClick={handleSave}
                  className="px-10 shadow-lg"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Settings;
