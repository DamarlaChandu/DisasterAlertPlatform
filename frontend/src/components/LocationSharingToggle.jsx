import React, { useState, useEffect } from 'react';
import { FiMapPin, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import useGeolocation from '../hooks/useGeolocation';
import { useAuthStore } from '../context/store';

const LocationSharingToggle = () => {
  const { user } = useAuthStore();
  const [enabled, setEnabled] = useState(user?.shareLocation || false);
  const { 
    location, 
    error, 
    loading, 
    isSharing, 
    toggleSharing 
  } = useGeolocation({ 
    trackLive: enabled,
    userName: user?.name 
  });

  const handleToggle = async () => {
    const nextState = !enabled;
    setEnabled(nextState);
    await toggleSharing(nextState);
  };


  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-100 transition-all hover:shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} transition-colors`}>
            <FiMapPin size={24} className={enabled && isSharing ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Live Location Sharing</h3>
            <p className="text-sm text-gray-500">
              {enabled 
                ? 'Your location is being broadcasted to admins and citizens you help.' 
                : 'Share your location to help citizens find you and track your arrival.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {enabled && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
              {loading ? (
                <>
                  <FiLoader className="animate-spin" />
                  <span>Acquiring GPS...</span>
                </>
              ) : error ? (
                <>
                  <FiAlertCircle className="text-red-500" />
                  <span className="text-red-500">{error}</span>
                </>
              ) : (
                <>
                  <FiCheckCircle />
                  <span>Live: {location?.latitude.toFixed(4)}, {location?.longitude.toFixed(4)}</span>
                </>
              )}
            </div>
          )}
          
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              enabled ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`${
                enabled ? 'translate-x-8' : 'translate-x-1'
              } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start gap-2">
          <FiAlertCircle className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Location Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSharingToggle;
