import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import { resourceAPI } from '../services/api';
import { useAuthStore } from '../context/store';
import { socketEmit } from '../socket/socketManager';

export default function RequestResource() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [getLocationLoading, setGetLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    resourceType: '',
    quantity: 1,
    urgency: 'normal',
    location: {
      coordinates: [0, 0],
      address: '',
    },
    description: '',
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
      [name]: name === 'quantity' ? parseInt(value) : value,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.resourceType || !formData.location.address) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await resourceAPI.createRequest(formData);
      const newRequest = response.data.data;

      setSuccess('Resource request created successfully!');

      // Emit Socket.io event for real-time notification
      socketEmit('new_request', {
        requestId: newRequest._id,
        resourceType: newRequest.resourceType,
        location: newRequest.location,
        urgency: newRequest.urgency,
        createdAt: newRequest.createdAt,
        citizenId: newRequest.citizenId,
      });

      setTimeout(() => {
        navigate('/requests');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const resourceTypes = [
    { value: 'food', label: '🍎 Food' },
    { value: 'water', label: '💧 Water' },
    { value: 'shelter', label: '🏘️ Shelter' },
    { value: 'medical', label: '⚕️ Medical' },
    { value: 'clothing', label: '👕 Clothing' },
    { value: 'tools', label: '🔧 Tools' },
    { value: 'fuel', label: '⛽ Fuel' },
  ];

  const urgencyLevels = [
    { value: 'normal', label: 'Normal' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Request Resources</h1>
            <p className="text-gray-600 mb-6">
              Request the resources you need. Volunteers will be notified immediately.
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
              {/* Resource Type */}
              <Select
                label="Resource Type"
                name="resourceType"
                value={formData.resourceType}
                onChange={handleChange}
                options={resourceTypes}
                required
              />

              {/* Quantity */}
              <Input
                label="Quantity"
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
              />

              {/* Urgency */}
              <Select
                label="Urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                options={urgencyLevels}
              />

              {/* Description */}
              <Textarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide any additional details about your request..."
                rows="4"
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
                    📍 Get Current Location
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
                  Submit Request
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
