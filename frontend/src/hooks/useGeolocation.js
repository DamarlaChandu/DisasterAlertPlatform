import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../services/apiClient';
import { socketEmit } from '../socket/socketManager';
import { useAuthStore } from '../context/store';

/**
 * Custom hook for real-time geolocation tracking
 * @param {Object} options - Hook options
 * @param {boolean} options.trackLive - Whether to track location continuously
 * @param {number} options.updateInterval - Interval for server updates in ms
 * @param {string} options.activeRequestId - Optional ID of current active task
 * @param {string} options.citizenId - Optional ID of citizen being helped
 */
const useGeolocation = ({ 
  trackLive = false, 
  updateInterval = 10000,
  activeRequestId = null,
  citizenId = null,
  userName = ''
} = {}) => {
  const { user } = useAuthStore();
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const watchId = useRef(null);

  const lastUpdate = useRef(0);

  const updateServerLocation = useCallback(async (coords, accuracy) => {
    try {
      const now = Date.now();
      // Throttling: 5s for volunteers, 30s for others (matching backend)
      const waitTime = user?.role === 'volunteer' ? 5000 : 30000;
      
      // Add a 500ms buffer to prevent race conditions with backend
      if (now - lastUpdate.current < (waitTime - 500)) return;
      
      lastUpdate.current = now;

      // 1. Update via Socket for real-time broadcast (PRIORITY for "Live" feel)
      socketEmit('location:update', {
        coordinates: [coords.longitude, coords.latitude],
        accuracy,
        activeRequestId,
        citizenId,
        userName: userName || user?.name,
        timestamp: new Date()
      });

      // 2. Update via HTTP for persistent storage (Wrap in try-catch to ignore throttle errors in real-time)
      try {
        await apiClient.post('/location/update', {
          coordinates: [coords.longitude, coords.latitude],
          accuracy
        });
        console.log('Location persisted to database');
      } catch (err) {
        if (err.response?.status === 429) {
          // Throttled by backend, but socket already sent, so it's fine for live view
          console.log('Location persistence throttled (Database)');
        } else {
          console.error('Failed to persist location:', err);
        }
      }
    } catch (err) {
      console.error('Failed to update location on server:', err);
    }
  }, [activeRequestId, citizenId, userName, user]);


  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    setLoading(true);

    const onSuccess = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      const newLocation = { latitude, longitude, accuracy };
      
      setLocation(newLocation);
      setError(null);
      setLoading(false);
      setIsSharing(true);

      // Trigger server update
      updateServerLocation(newLocation, accuracy);
    };

    const onError = (error) => {
      let message = 'An unknown error occurred';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'User denied the request for Geolocation. Please enable it in browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          message = 'The request to get user location timed out.';
          break;
      }
      setError(message);
      setLoading(false);
      setIsSharing(false);
    };

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    if (trackLive) {
      watchId.current = navigator.geolocation.watchPosition(onSuccess, onError, geoOptions);
    } else {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, geoOptions);
    }
  }, [trackLive, updateServerLocation]);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsSharing(false);
  }, []);

  const toggleSharing = useCallback(async (enabled) => {
    try {
      await apiClient.post('/location/sharing', { enabled });
      if (enabled) {
        startTracking();
      } else {
        stopTracking();
      }
    } catch (err) {
      console.error('Failed to toggle location sharing:', err);
    }
  }, [startTracking, stopTracking]);

  useEffect(() => {
    if (trackLive) {
      startTracking();
    }
    return () => stopTracking();
  }, [trackLive, startTracking, stopTracking]);

  return {
    location,
    error,
    loading,
    isSharing,
    startTracking,
    stopTracking,
    toggleSharing
  };
};

export default useGeolocation;