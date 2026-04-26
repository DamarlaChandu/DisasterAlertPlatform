import { useState, useEffect } from 'react';
import { alertAPI, resourceAPI } from '../services/api';

export function useMapData(position, radius = 10) {
  const [disasters, setDisasters] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!position) return;

    setLoading(true);
    setError(null);

    try {
      const [disastersRes, requestsRes] = await Promise.all([
        alertAPI.getNearbyDisasters(position.longitude, position.latitude, radius),
        resourceAPI.getNearbyRequests(position.longitude, position.latitude, radius),
      ]);

      setDisasters(disastersRes.data.data || []);
      setRequests(requestsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [position?.latitude, position?.longitude, radius]);

  return {
    disasters,
    requests,
    loading,
    error,
    refetch: fetchData,
  };
}