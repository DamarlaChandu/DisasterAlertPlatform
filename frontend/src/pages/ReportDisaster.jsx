import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiAlertTriangle } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import { alertAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { socketEmit } from '../socket/socketManager';

export default function ReportDisaster() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [getLocationLoading, setGetLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    disasterType: '',
    description: '',
    location: {
      coordinates: [0, 0],
      address: '',
    },
    resourcesNeeded: [],
  });

  useEffect(() => {
    if (!user || user.role !== 'citizen') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
  };

  const handleGetCurrentLocation = () => {
    setGetLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: [longitude, latitude],
            },
          }));

          // Get address from coordinates (reverse geocoding)
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                address: data.address?.road || data.address?.city || `${latitude}, ${longitude}`,
              },
            }));
          } catch (err) {
            console.log('Could not get address');
          }
          setGetLocationLoading(false);
        },
        () => {
          setError('Could not get your location. Please enter it manually.');
          setGetLocationLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setGetLocationLoading(false);
    }
  };

  const handleResourceChange = (resource) => {
    setFormData((prev) => ({
      ...prev,
      resourcesNeeded: prev.resourcesNeeded.includes(resource)
        ? prev.resourcesNeeded.filter((r) => r !== resource)
        : [...prev.resourcesNeeded, resource],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (
      !formData.disasterType ||
      !formData.description ||
      !formData.location.address ||
      !formData.location.coordinates[0]
    ) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await alertAPI.createReport(formData);
      const newDisaster = response.data.data;

      setSuccess('Disaster reported successfully!');
      
      // Emit Socket.io event for real-time notification
      socketEmit('disaster_alert', {
        reportId: newDisaster._id,
        disasterType: newDisaster.disasterType,
        location: newDisaster.location,
        severity: newDisaster.severity,
        description: newDisaster.description,
        createdAt: newDisaster.createdAt,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report disaster');
    } finally {
      setLoading(false);
    }
  };

  const resourceOptions = [
    { value: 'food', label: '🍎 Food' },
    { value: 'water', label: '💧 Water' },
    { value: 'shelter', label: '🏘️ Shelter' },
    { value: 'medical', label: '⚕️ Medical' },
    { value: 'clothing', label: '👕 Clothing' },
    { value: 'tools', label: '🔧 Tools' },
  ];

  const disasterTypes = [
    { value: 'flood', label: 'Flood' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'cyclone', label: 'Cyclone' },
    { value: 'fire', label: 'Fire' },
    { value: 'landslide', label: 'Landslide' },
    { value: 'storm', label: 'Storm' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FiAlertTriangle className="text-primary text-3xl" />
              <h1 className="text-3xl font-bold text-gray-800">Report a Disaster</h1>
            </div>

            <p className="text-gray-600 mb-6">
              Provide details about the disaster to help volunteers and authorities respond quickly.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Disaster Type */}
              <Select
                label="Disaster Type"
                name="disasterType"
                value={formData.disasterType}
                onChange={handleChange}
                options={disasterTypes}
                required
              />

              {/* Description */}
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the disaster, its severity, and affected areas..."
                required
                rows="5"
              />

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    loading={getLocationLoading}
                  >
                    <FiMapPin />
                    Get Current Location
                  </Button>
                </div>

                <Input
                  label="Address"
                  type="text"
                  name="address"
                  value={formData.location.address}
                  onChange={handleLocationChange}
                  placeholder="Enter address or click 'Get Current Location'"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Longitude"
                    type="number"
                    name="longitude"
                    value={formData.location.coordinates[0]}
                    onChange={(e) => {
                      const newCoords = [...formData.location.coordinates];
                      newCoords[0] = parseFloat(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, coordinates: newCoords },
                      }));
                    }}
                    step="0.000001"
                  />
                  <Input
                    label="Latitude"
                    type="number"
                    name="latitude"
                    value={formData.location.coordinates[1]}
                    onChange={(e) => {
                      const newCoords = [...formData.location.coordinates];
                      newCoords[1] = parseFloat(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        location: { ...prev.location, coordinates: newCoords },
                      }));
                    }}
                    step="0.000001"
                  />
                </div>
              </div>

              {/* Resources Needed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Resources Needed
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {resourceOptions.map((resource) => (
                    <label key={resource.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.resourcesNeeded.includes(resource.value)}
                        onChange={() => handleResourceChange(resource.value)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="text-gray-700">{resource.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="flex-1"
                >
                  Report Disaster
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
