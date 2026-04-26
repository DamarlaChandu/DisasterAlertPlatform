import User from '../models/User.js';
import ResourceRequest from '../models/ResourceRequest.js';
import DisasterReport from '../models/DisasterReport.js';
import { AppError } from '../utils/errorHandler.js';

// Live Location Management Service
class LocationService {
  /**
   * Update user's current live location
   * @param {String} userId - User ID
   * @param {Array} coordinates - [longitude, latitude]
   * @param {Number} accuracy - GPS accuracy in meters
   */
  async updateUserLocation(userId, coordinates, accuracy = null) {
    if (!coordinates || coordinates.length !== 2) {
      throw new AppError('Invalid coordinates format', 400);
    }

    const [longitude, latitude] = coordinates;

    // Validate coordinates
    if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
      throw new AppError('Invalid coordinates: out of bounds', 400);
    }

    // Prevent spam updates - must be at least 30 seconds apart
    const user = await User.findById(userId);
    if (user && user.currentLocation?.updatedAt) {
      const timeDiff = Date.now() - new Date(user.currentLocation.updatedAt).getTime();
      if (timeDiff < 30000) {
        // 30 second throttle
        throw new AppError('Location update throttled: wait 30 seconds', 429);
      }
    }

    // Calculate distance from previous location to detect unrealistic jumps
    if (user?.currentLocation?.coordinates && user.currentLocation.coordinates[0] !== 0) {
      const distance = this.calculateDistance(
        user.currentLocation.coordinates,
        coordinates
      );
      // If moved >500km in <30 seconds, reject as invalid
      if (distance > 500) {
        throw new AppError('Unrealistic location jump detected', 400);
      }
    }

    // Update current location
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        currentLocation: {
          type: 'Point',
          coordinates: coordinates,
          updatedAt: new Date(),
          accuracy: accuracy || 0,
        },
        // Keep location history (max last 50 locations)
        $push: {
          locationHistory: {
            $each: [
              {
                coordinates: coordinates,
                timestamp: new Date(),
                accuracy: accuracy || 0,
              },
            ],
            $slice: -50, // Keep only last 50
          },
        },
      },
      { new: true }
    );

    return {
      userId: updatedUser._id,
      coordinates: updatedUser.currentLocation.coordinates,
      updatedAt: updatedUser.currentLocation.updatedAt,
      accuracy: updatedUser.currentLocation.accuracy,
    };
  }

  /**
   * Get user's current location
   */
  async getUserLocation(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.shareLocation) {
      throw new AppError('User has not enabled location sharing', 403);
    }

    return {
      userId: user._id,
      name: user.name,
      role: user.role,
      coordinates: user.currentLocation?.coordinates || [0, 0],
      updatedAt: user.currentLocation?.updatedAt,
      accuracy: user.currentLocation?.accuracy,
      shareLocation: user.shareLocation,
    };
  }

  /**
   * Enable/disable location sharing for a user
   */
  async setLocationSharing(userId, enabled) {
    const user = await User.findByIdAndUpdate(
      userId,
      { shareLocation: enabled },
      { new: true }
    );

    return {
      userId: user._id,
      shareLocation: user.shareLocation,
    };
  }

  /**
   * Find all volunteers within a given radius of a location
   * @param {Array} coordinates - [longitude, latitude]
   * @param {Number} radiusKm - Search radius in kilometers
   * @param {Boolean} activeOnly - Only return volunteers with shareLocation enabled
   */
  async findNearbyVolunteers(coordinates, radiusKm = 10, activeOnly = true) {
    if (!coordinates || coordinates.length !== 2) {
      throw new AppError('Invalid coordinates', 400);
    }

    const radiusMeters = radiusKm * 1000;

    let query = {
      role: 'volunteer',
      'currentLocation.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
          $maxDistance: radiusMeters,
        },
      },
    };

    if (activeOnly) {
      query.shareLocation = true;
    }

    const volunteers = await User.find(query)
      .select('_id name phone currentLocation skills isActive')
      .sort({
        'currentLocation.coordinates': 1,
      })
      .limit(50); // Prevent excessive results

    // Calculate distance for each volunteer
    const volunteersWithDistance = volunteers.map((vol) => ({
      _id: vol._id,
      name: vol.name,
      phone: vol.phone,
      location: vol.currentLocation?.coordinates || [0, 0],
      distance: this.calculateDistance(coordinates, vol.currentLocation?.coordinates || [0, 0]),
      skills: vol.skills || [],
      isActive: vol.isActive,
      updatedAt: vol.currentLocation?.updatedAt,
    }));

    // Sort by distance
    volunteersWithDistance.sort((a, b) => a.distance - b.distance);

    return volunteersWithDistance;
  }

  /**
   * Find all disasters within a given radius
   */
  async findNearbyDisasters(coordinates, radiusKm = 15) {
    if (!coordinates || coordinates.length !== 2) {
      throw new AppError('Invalid coordinates', 400);
    }

    const radiusMeters = radiusKm * 1000;

    const disasters = await DisasterReport.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
          $maxDistance: radiusMeters,
        },
      },
      status: 'active',
    })
      .select('_id disasterType severity location description userId createdAt')
      .sort({
        'location.coordinates': 1,
      })
      .limit(50);

    // Calculate distance and add to response
    const disastersWithDistance = disasters.map((disaster) => ({
      _id: disaster._id,
      type: disaster.disasterType,
      severity: disaster.severity,
      location: disaster.location,
      description: disaster.description,
      distance: this.calculateDistance(coordinates, disaster.location.coordinates),
      createdAt: disaster.createdAt,
      reportedBy: disaster.userId,
    }));

    return disastersWithDistance.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Find all resource requests within a given radius
   */
  async findNearbyRequests(coordinates, radiusKm = 10) {
    if (!coordinates || coordinates.length !== 2) {
      throw new AppError('Invalid coordinates', 400);
    }

    const radiusMeters = radiusKm * 1000;

    const requests = await ResourceRequest.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
          $maxDistance: radiusMeters,
        },
      },
      status: 'pending',
    })
      .select(
        '_id resourceType quantity urgency location description citizenId createdAt'
      )
      .populate('citizenId', 'name phone')
      .sort({
        'location.coordinates': 1,
      })
      .limit(50);

    // Calculate distance
    const requestsWithDistance = requests.map((req) => ({
      _id: req._id,
      resourceType: req.resourceType,
      quantity: req.quantity,
      urgency: req.urgency,
      location: req.location,
      description: req.description,
      distance: this.calculateDistance(coordinates, req.location.coordinates),
      citizen: req.citizenId,
      createdAt: req.createdAt,
    }));

    return requestsWithDistance.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get all active volunteer locations (for admin dashboard)
   * Returns only volunteers with shareLocation enabled
   */
  async getActiveVolunteerLocations() {
    const volunteers = await User.find({
      role: 'volunteer',
      shareLocation: true,
      isActive: true,
    })
      .select('_id name phone currentLocation skills lastSeenAt')
      .sort({ 'currentLocation.updatedAt': -1 });

    return volunteers.map((vol) => ({
      _id: vol._id,
      name: vol.name,
      role: 'volunteer',
      phone: vol.phone,
      location: vol.currentLocation?.coordinates || [0, 0],
      accuracy: vol.currentLocation?.accuracy,
      updatedAt: vol.currentLocation?.updatedAt,
      skills: vol.skills,
    }));
  }

  /**
   * Get all active citizen locations (for admin dashboard)
   */
  async getActiveCitizenLocations() {
    const citizens = await User.find({
      role: 'citizen',
      shareLocation: true,
    })
      .select('_id name phone currentLocation lastSeenAt')
      .sort({ 'currentLocation.updatedAt': -1 });

    return citizens.map((cit) => ({
      _id: cit._id,
      name: cit.name,
      role: 'citizen',
      phone: cit.phone,
      location: cit.currentLocation?.coordinates || [0, 0],
      accuracy: cit.currentLocation?.accuracy,
      updatedAt: cit.currentLocation?.updatedAt,
    }));
  }


  /**
   * Get all active disaster locations (for admin dashboard)
   */
  async getActiveDisasterLocations() {
    const disasters = await DisasterReport.find({
      status: 'active',
    })
      .select('_id disasterType severity location description affectedPeople createdAt')
      .sort({ createdAt: -1 });

    return disasters.map((dis) => ({
      _id: dis._id,
      type: dis.disasterType,
      severity: dis.severity,
      location: dis.location,
      description: dis.description,
      affectedPeople: dis.affectedPeople,
      createdAt: dis.createdAt,
    }));
  }

  /**
   * Get location history for a user (admin only)
   */
  async getUserLocationHistory(userId, limit = 30) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      userId: user._id,
      name: user.name,
      role: user.role,
      history: (user.locationHistory || []).slice(-limit).reverse(),
    };
  }

  /**
   * Assign closest volunteer to a resource request
   * Automatically assigns the nearest available volunteer
   */
  async assignClosestVolunteer(requestId) {
    const request = await ResourceRequest.findById(requestId);

    if (!request) {
      throw new AppError('Resource request not found', 404);
    }

    if (request.status !== 'pending') {
      throw new AppError('Request is not pending', 400);
    }

    // Find nearby active volunteers
    const nearbyVolunteers = await this.findNearbyVolunteers(
      request.location.coordinates,
      20, // 20km radius
      true
    );

    if (nearbyVolunteers.length === 0) {
      throw new AppError('No nearby volunteers available', 404);
    }

    // Get closest volunteer
    const closestVolunteer = nearbyVolunteers[0];

    // Update request with assigned volunteer
    const updatedRequest = await ResourceRequest.findByIdAndUpdate(
      requestId,
      {
        assignedVolunteer: closestVolunteer._id,
        status: 'accepted',
        acceptedAt: new Date(),
      },
      { new: true }
    ).populate('assignedVolunteer', 'name phone');

    return {
      requestId: updatedRequest._id,
      assignedVolunteer: {
        _id: closestVolunteer._id,
        name: closestVolunteer.name,
        phone: closestVolunteer.phone,
        distance: closestVolunteer.distance,
      },
    };
  }

  /**
   * Calculate distance between two geo-coordinates (Haversine formula)
   * Returns distance in kilometers
   */
  calculateDistance(coord1, coord2) {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Get a heat map of activity (disasters + requests) in an area
   */
  async getActivityHeatMap(coordinates, radiusKm = 20) {
    const [disasters, requests] = await Promise.all([
      this.findNearbyDisasters(coordinates, radiusKm),
      this.findNearbyRequests(coordinates, radiusKm),
    ]);

    return {
      center: coordinates,
      radius: radiusKm,
      disasters: disasters.length,
      requests: requests.length,
      totalActivity: disasters.length + requests.length,
      zones: this.createActivityZones(disasters, requests),
    };
  }

  /**
   * Create activity zones for heat mapping
   */
  createActivityZones(disasters, requests) {
    const zones = {};

    // Group by distance rings
    const ranges = [
      { min: 0, max: 5, zone: 'critical' },
      { min: 5, max: 10, zone: 'high' },
      { min: 10, max: 20, zone: 'medium' },
      { min: 20, max: 50, zone: 'low' },
    ];

    ranges.forEach((range) => {
      zones[range.zone] = {
        disasters: disasters.filter((d) => d.distance >= range.min && d.distance < range.max)
          .length,
        requests: requests.filter((r) => r.distance >= range.min && r.distance < range.max)
          .length,
      };
    });

    return zones;
  }
}

export default new LocationService();
