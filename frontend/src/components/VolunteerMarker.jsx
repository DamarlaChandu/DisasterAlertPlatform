import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FiUser, FiPhone, FiStar, FiActivity } from 'react-icons/fi';

// Custom icon for volunteers (Yellow)
const volunteerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for citizens (Blue)
const citizenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const VolunteerMarker = ({ volunteer }) => {
  if (!volunteer.location) return null;

  const isCitizen = volunteer.role === 'citizen';
  const icon = isCitizen ? citizenIcon : volunteerIcon;
  const themeColor = isCitizen ? 'blue' : 'yellow';

  return (
    <Marker 
      position={[volunteer.location[1], volunteer.location[0]]} 
      icon={icon}
    >
      <Popup className={`${themeColor}-popup`}>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <div className={`bg-${themeColor}-100 p-2 rounded-full text-${themeColor}-600`}>
              <FiUser size={18} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{volunteer.name}</h4>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                {isCitizen ? 'Active Citizen' : 'Active Volunteer'}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FiPhone className="text-gray-400" size={14} />
              <span>{volunteer.phone || 'No phone provided'}</span>
            </div>
            
            {!isCitizen && volunteer.skills && volunteer.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {volunteer.skills.slice(0, 3).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-50 text-[10px]">
              <span className={`flex items-center gap-1 text-${isCitizen ? 'blue' : 'green'}-600`}>
                <FiActivity size={10} /> Live Tracking
              </span>
              <span className="text-gray-400">
                Updated {volunteer.updatedAt ? new Date(volunteer.updatedAt).toLocaleTimeString() : 'Recently'}
              </span>
            </div>
          </div>
          
          <button 
            className={`w-full mt-3 py-2 bg-${themeColor}-500 hover:bg-${themeColor}-600 text-white text-xs font-bold rounded transition-colors`}
            onClick={() => window.location.href = `tel:${volunteer.phone}`}
          >
            Call {isCitizen ? 'Citizen' : 'Volunteer'}
          </button>
        </div>
      </Popup>
    </Marker>
  );
};


export default VolunteerMarker;
