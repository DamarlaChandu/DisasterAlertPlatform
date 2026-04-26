import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuthStore } from '../context/store';
import useGeolocation from '../hooks/useGeolocation';
import { useMapData } from '../hooks/useMapData';
import DisasterMarker from '../components/DisasterMarker';
import RequestMarker from '../components/RequestMarker';
import UserLocationMarker from '../components/UserLocationMarker';
import VolunteerMarker from '../components/VolunteerMarker';
import { socketOn, socketOff } from '../socket/socketManager';
import apiClient from '../services/apiClient';

export default function Map() {
  const { user } = useAuthStore();
  const { location: position, error: geoError, loading: geoLoading } = useGeolocation({ 
    trackLive: true,
    userName: user?.name
  });
  const { disasters, requests, loading: dataLoading, error: dataError, refetch } = useMapData(position);
  const [volunteers, setVolunteers] = useState([]);

  const [center, setCenter] = useState([20.5937, 78.9629]); // India center fallback

  // Update center when position is available
  useEffect(() => {
    if (position) {
      setCenter([position.latitude, position.longitude]);
    }
  }, [position]);

  // Fetch initial volunteer locations
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await apiClient.get('/location/nearby-volunteers', {
          params: {
            longitude: position?.longitude || 78.9629,
            latitude: position?.latitude || 20.5937,
            radius: 50 // Wider radius for the general map
          }
        });
        setVolunteers(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch volunteers:', err);
      }
    };

    fetchVolunteers();
  }, [position]);

  // Socket event handlers for real-time updates
  useEffect(() => {
    const handleDisasterAlert = (data) => {
      console.log('New disaster alert:', data);
      refetch();
    };

    const handleNewRequest = (data) => {
      console.log('New resource request:', data);
      refetch();
    };

    const handleUserMove = (data) => {
      setVolunteers((prev) => {
        const index = prev.findIndex((v) => v._id === data.userId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            role: data.role,
            location: data.coordinates,
            updatedAt: data.updatedAt,
            accuracy: data.accuracy
          };
          return updated;
        } else {
          return [...prev, {
            _id: data.userId,
            name: data.name,
            role: data.role,
            location: data.coordinates,
            updatedAt: data.updatedAt,
            accuracy: data.accuracy
          }];
        }
      });
    };

    socketOn('disaster_alert', handleDisasterAlert);
    socketOn('new_request', handleNewRequest);
    socketOn('volunteer:move', handleUserMove);

    return () => {
      socketOff('disaster_alert', handleDisasterAlert);
      socketOff('new_request', handleNewRequest);
      socketOff('volunteer:move', handleUserMove);
    };


  }, [refetch]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Disaster & Resources Map</h1>
          <p className="text-gray-600 mb-8">View all active disasters and pending resource requests on an interactive map</p>

          {/* Interactive Map */}
          <div className="rounded-lg shadow-lg overflow-hidden min-h-[600px]">
            {geoLoading ? (
              <div className="h-[600px] flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Getting your location...</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={center}
                zoom={position ? 12 : 5} // Closer zoom if we have user location
                style={{ height: '600px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* User Location Marker */}
                <UserLocationMarker position={position} />

                {/* Disaster Markers */}
                {disasters.map((disaster) => (
                  <DisasterMarker key={disaster._id} disaster={disaster} />
                ))}

                {/* Resource Request Markers */}
                {requests.map((request) => (
                  <RequestMarker key={request._id} request={request} />
                ))}

                {/* Volunteer Markers */}
                {volunteers.map((volunteer) => (
                  <VolunteerMarker key={volunteer._id} volunteer={volunteer} />
                ))}
              </MapContainer>
            )}

            {geoError && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Location access denied:</strong> {geoError}. Using default location.
                </p>
              </div>
            )}

            {dataError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  <strong>Data loading error:</strong> {dataError}
                </p>
              </div>
            )}
          </div>

          {/* Map Legend */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
              <div className="w-6 h-6 bg-green-500 rounded-full mb-4"></div>
              <h4 className="font-bold text-gray-800 mb-2">🟢 Your Location</h4>
              <p className="text-gray-600 text-sm">Shows your current position on the map</p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="w-6 h-6 bg-red-500 rounded-full mb-4"></div>
              <h4 className="font-bold text-gray-800 mb-2">🔴 Active Disasters</h4>
              <p className="text-gray-600 text-sm">Shows current disaster locations with severity levels</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="w-6 h-6 bg-blue-500 rounded-full mb-4"></div>
              <h4 className="font-bold text-gray-800 mb-2">🔵 Resource Requests</h4>
              <p className="text-gray-600 text-sm">Pending resource requests waiting for volunteers</p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <div className="w-6 h-6 bg-yellow-500 rounded-full mb-4"></div>
              <h4 className="font-bold text-gray-800 mb-2">🟡 Volunteer Locations</h4>
              <p className="text-gray-600 text-sm">Active volunteers ready to provide assistance</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
