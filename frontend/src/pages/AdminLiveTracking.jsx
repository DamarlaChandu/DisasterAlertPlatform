import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import apiClient from '../services/apiClient';
import { socketOn, socketOff } from '../socket/socketManager';
import { FiUsers, FiAlertCircle, FiActivity, FiSearch, FiLayers } from 'react-icons/fi';
import VolunteerMarker from '../components/VolunteerMarker';
import DisasterMarker from '../components/DisasterMarker';
import RequestMarker from '../components/RequestMarker';


const AdminLiveTracking = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [disasters, setDisasters] = useState([]);
  const [requests, setRequests] = useState([]);


  const [stats, setStats] = useState({
    activeVolunteers: 0,
    activeCitizens: 0,
    activeDisasters: 0,
    responseZones: 0
  });

  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'volunteers', 'disasters'
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [matchingResults, setMatchingResults] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVolunteers = volunteers.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.phone?.includes(searchTerm)
  );

  const filteredDisasters = disasters.filter(d => 
    d.type?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const safeFetch = async (url) => {
          try {
            const res = await apiClient.get(url);
            return res.data;
          } catch (e) {
            console.error(`Failed to fetch ${url}:`, e);
            return { data: [], count: 0 };
          }
        };

        const [volData, citData, disData, reqData] = await Promise.all([
          safeFetch('/location/admin/volunteers'),
          safeFetch('/location/admin/citizens'),
          safeFetch('/location/admin/disasters'),
          safeFetch('/resources')
        ]);
        
        setVolunteers(volData.data || []);
        setCitizens(citData.data || []);
        setDisasters(disData.data || []);
        setRequests(reqData.data || []);

        setStats({
          activeVolunteers: volData.count || (volData.data?.length) || 0,
          activeCitizens: citData.count || (citData.data?.length) || 0,
          activeDisasters: disData.count || (disData.data?.length) || 0,
          responseZones: calculateResponseZones(disData.data || [])
        });

      } catch (err) {
        console.error('Failed to fetch admin tracking data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Live movement updates
    const handleUserMove = (data) => {
      const updateList = (prev) => {
        const index = prev.findIndex((u) => u._id === data.userId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
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
      };

      if (data.role === 'volunteer') {
        setVolunteers(updateList);
      } else if (data.role === 'citizen') {
        setCitizens(updateList);
      }
    };


    const handleNewDisaster = (data) => {
      setDisasters((prev) => [data, ...prev]);
      setStats(s => ({ ...s, activeDisasters: s.activeDisasters + 1 }));
    };

    const handleNewRequest = (data) => {
      setRequests((prev) => [data, ...prev]);
    };

    socketOn('user:move', handleUserMove);

    socketOn('new_disaster', handleNewDisaster);
    socketOn('new_request', handleNewRequest);


    return () => {
      socketOff('user:move', handleUserMove);

      socketOff('new_disaster', handleNewDisaster);
      socketOff('new_request', handleNewRequest);

    };
  }, []);

  const calculateResponseZones = (disasters) => {
    // Unique locations of disasters
    return disasters?.length || 0;
  };

  const handleSelectDisaster = async (disaster) => {
    setSelectedDisaster(disaster);
    setMatchingResults(null);
    setIsMatching(true);

    try {
      const res = await apiClient.get('/location/nearby-volunteers', {
        params: {
          longitude: disaster.location.coordinates[0],
          latitude: disaster.location.coordinates[1],
          radius: 20
        }
      });
      setMatchingResults(res.data.data);
    } catch (err) {
      console.error('Failed to find matching volunteers:', err);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FiActivity className="text-primary" /> Live Response Monitoring
              </h1>
              <p className="text-sm text-gray-500">Real-time tracking of volunteers and active disaster zones</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Active Volunteers</p>
                <p className="text-xl font-bold text-blue-800">{stats.activeVolunteers}</p>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Citizens Online</p>
                <p className="text-xl font-bold text-green-800">{stats.activeCitizens}</p>
              </div>
              <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">Disaster Zones</p>
                <p className="text-xl font-bold text-red-800">{stats.activeDisasters}</p>
              </div>


            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row h-full">
          {/* Sidebar Tracking List */}
          <div className="w-full lg:w-96 bg-white border-r overflow-y-auto max-h-[400px] lg:max-h-none">
            <div className="p-4 border-b sticky top-0 bg-white z-10">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search responders or incidents..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setViewMode('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${viewMode === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setViewMode('volunteers')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${viewMode === 'volunteers' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Responders
                </button>
                <button 
                  onClick={() => setViewMode('disasters')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${viewMode === 'disasters' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Incidents
                </button>
              </div>
            </div>

            <div className="divide-y">
              {viewMode !== 'disasters' && [...filteredVolunteers, ...citizens.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))].map(user => (
                <div key={user._id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{user.name}</h3>
                    <span className={`flex items-center gap-1 text-[10px] ${user.role === 'citizen' ? 'text-blue-600' : 'text-green-600'} font-bold`}>
                      <span className={`w-1.5 h-1.5 ${user.role === 'citizen' ? 'bg-blue-500' : 'bg-green-500'} rounded-full animate-pulse`}></span> 
                      {user.role === 'citizen' ? 'CITIZEN' : 'VOLUNTEER'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{user.phone}</p>
                  <div className="flex flex-wrap gap-1">
                    {user.role === 'volunteer' && user.skills?.slice(0, 2).map(s => (
                      <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">{s}</span>
                    ))}
                    {user.role === 'citizen' && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px]">Location Shared</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Last update: {user.updatedAt ? new Date(user.updatedAt).toLocaleTimeString() : 'Recently'}
                  </p>
                </div>
              ))}

              
              {viewMode !== 'volunteers' && filteredDisasters.map(dis => (
                <div 
                  key={dis._id} 
                  onClick={() => handleSelectDisaster(dis)}
                  className={`p-4 cursor-pointer border-l-4 transition-colors ${
                    selectedDisaster?._id === dis._id 
                      ? 'bg-red-50 border-red-600 shadow-inner' 
                      : 'hover:bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-red-800 uppercase text-xs tracking-wider">{dis.type}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      dis.severity === 'critical' ? 'bg-red-600 text-white' : 
                      dis.severity === 'high' ? 'bg-orange-500 text-white' : 'bg-yellow-400 text-gray-800'
                    }`}>
                      {dis.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{dis.description}</p>
                  <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                    <FiLayers /> {dis.affectedPeople || 0} people affected
                  </p>
                </div>
              ))}
            </div>

            {/* Selected Disaster Matching Panel */}
            {selectedDisaster && (
              <div className="p-6 bg-gray-900 text-white border-t border-gray-800 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                    <FiUsers /> Nearest Responders
                  </h3>
                  <button onClick={() => setSelectedDisaster(null)} className="text-gray-500 hover:text-white">&times;</button>
                </div>
                
                {isMatching ? (
                  <div className="flex items-center gap-3 py-4 text-xs text-gray-400">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    Searching area...
                  </div>
                ) : matchingResults?.length > 0 ? (
                  <div className="space-y-3">
                    {matchingResults.slice(0, 3).map(vol => (
                      <div key={`match-${vol._id}`} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-xs">{vol.name}</p>
                          <p className="text-[10px] text-primary font-bold">
                            {vol.distance < 1 ? '< 1 km' : `${vol.distance.toFixed(1)} km`}
                          </p>
                        </div>
                        <p className="text-[10px] text-gray-500">{vol.phone}</p>
                      </div>
                    ))}
                    <button className="w-full py-2 bg-primary text-white rounded text-[10px] font-bold uppercase mt-2 hover:bg-opacity-90">
                      Broadcast Alert to Group
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-4">No volunteers found within 20km.</p>
                )}
              </div>
            )}
          </div>

          {/* Map Area */}
          <div className="flex-1 relative min-h-[500px]">
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Disaster Heat Zones (Circles) */}
              {disasters.filter(d => d.location?.coordinates).map(dis => (
                <Circle 
                  key={`zone-${dis._id}`}
                  center={[dis.location.coordinates[1], dis.location.coordinates[0]]}
                  radius={5000} // 5km zone
                  pathOptions={{
                    color: dis.severity === 'critical' ? 'red' : 'orange',
                    fillColor: dis.severity === 'critical' ? 'red' : 'orange',
                    fillOpacity: 0.1
                  }}
                />
              ))}

              {disasters.map(dis => (
                <DisasterMarker key={dis._id} disaster={dis} />
              ))}

              {volunteers.map(vol => (
                <VolunteerMarker key={vol._id} volunteer={vol} />
              ))}

              {citizens.map(cit => (
                <VolunteerMarker key={cit._id} volunteer={cit} />
              ))}


              {requests.map(req => (
                <RequestMarker key={req._id} request={req} />
              ))}

            </MapContainer>
            
            {/* Map Overlay Controls */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
              <button className="p-3 bg-white shadow-lg rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                <FiLayers size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminLiveTracking;
