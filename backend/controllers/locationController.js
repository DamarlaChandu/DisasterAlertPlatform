import locationService from '../services/locationService.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

// Update user's live location
export const updateLocation = asyncHandler(async (req, res) => {
  const { coordinates, accuracy } = req.body;

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new AppError('Coordinates must be [longitude, latitude]', 400);
  }

  const result = await locationService.updateUserLocation(
    req.user._id,
    coordinates,
    accuracy
  );

  res.status(200).json({
    success: true,
    message: 'Location updated',
    data: result,
  });
});

// Get user's current location
export const getMyLocation = asyncHandler(async (req, res) => {
  const location = await locationService.getUserLocation(req.user._id);

  res.status(200).json({
    success: true,
    data: location,
  });
});

// Enable/disable location sharing
export const setLocationSharing = asyncHandler(async (req, res) => {
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    throw new AppError('enabled must be a boolean', 400);
  }

  const result = await locationService.setLocationSharing(req.user._id, enabled);

  res.status(200).json({
    success: true,
    message: `Location sharing ${enabled ? 'enabled' : 'disabled'}`,
    data: result,
  });
});

// Find nearby volunteers
export const getNearbyVolunteers = asyncHandler(async (req, res) => {
  const { longitude, latitude, radius = 10 } = req.query;

  if (!longitude || !latitude) {
    throw new AppError('longitude and latitude required', 400);
  }

  const volunteers = await locationService.findNearbyVolunteers(
    [parseFloat(longitude), parseFloat(latitude)],
    parseFloat(radius)
  );

  res.status(200).json({
    success: true,
    count: volunteers.length,
    data: volunteers,
  });
});

// Find nearby disasters
export const getNearbyDisasters = asyncHandler(async (req, res) => {
  const { longitude, latitude, radius = 15 } = req.query;

  if (!longitude || !latitude) {
    throw new AppError('longitude and latitude required', 400);
  }

  const disasters = await locationService.findNearbyDisasters(
    [parseFloat(longitude), parseFloat(latitude)],
    parseFloat(radius)
  );

  res.status(200).json({
    success: true,
    count: disasters.length,
    data: disasters,
  });
});

// Find nearby requests
export const getNearbyRequests = asyncHandler(async (req, res) => {
  const { longitude, latitude, radius = 10 } = req.query;

  if (!longitude || !latitude) {
    throw new AppError('longitude and latitude required', 400);
  }

  const requests = await locationService.findNearbyRequests(
    [parseFloat(longitude), parseFloat(latitude)],
    parseFloat(radius)
  );

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// Get all active volunteer locations (Admin only)
export const getActiveVolunteerLocations = asyncHandler(async (req, res) => {
  const volunteers = await locationService.getActiveVolunteerLocations();

  res.status(200).json({
    success: true,
    count: volunteers.length,
    data: volunteers,
  });
});

// Get all active citizen locations (Admin only)
export const getActiveCitizenLocations = asyncHandler(async (req, res) => {
  const citizens = await locationService.getActiveCitizenLocations();

  res.status(200).json({
    success: true,
    count: citizens.length,
    data: citizens,
  });
});


// Get all active disaster locations (Admin only)
export const getActiveDisasterLocations = asyncHandler(async (req, res) => {
  const disasters = await locationService.getActiveDisasterLocations();

  res.status(200).json({
    success: true,
    count: disasters.length,
    data: disasters,
  });
});

// Get user's location history (Admin only)
export const getUserLocationHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 30 } = req.query;

  if (!userId) {
    throw new AppError('userId required', 400);
  }

  const history = await locationService.getUserLocationHistory(userId, parseInt(limit));

  res.status(200).json({
    success: true,
    data: history,
  });
});

// Get activity heat map
export const getActivityHeatMap = asyncHandler(async (req, res) => {
  const { longitude, latitude, radius = 20 } = req.query;

  if (!longitude || !latitude) {
    throw new AppError('longitude and latitude required', 400);
  }

  const heatMap = await locationService.getActivityHeatMap(
    [parseFloat(longitude), parseFloat(latitude)],
    parseFloat(radius)
  );

  res.status(200).json({
    success: true,
    data: heatMap,
  });
});

// Get location stats for a request (for matching)
export const getRequestLocationStats = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const { longitude, latitude, radius } = req.query;

  if (!longitude || !latitude) {
    throw new AppError('longitude and latitude required', 400);
  }

  const [volunteers, disasters] = await Promise.all([
    locationService.findNearbyVolunteers([parseFloat(longitude), parseFloat(latitude)], radius),
    locationService.findNearbyDisasters([parseFloat(longitude), parseFloat(latitude)], radius),
  ]);

  res.status(200).json({
    success: true,
    data: {
      nearbyVolunteers: volunteers.length,
      nearbyDisasters: disasters.length,
      volunteers: volunteers.slice(0, 10), // Top 10 closest
      disasters: disasters.slice(0, 5),
    },
  });
});
