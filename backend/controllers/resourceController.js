import resourceService from '../services/resourceService.js';
import coordinationService from '../services/coordinationService.js';
import locationService from '../services/locationService.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import notificationService from '../services/notificationService.js';


// Create resource request
export const createResourceRequest = asyncHandler(async (req, res) => {
  const { resourceType, quantity, location, description, disasterReportId, autoAssign = false } = req.body;

  if (!resourceType || !quantity || !location) {
    throw new AppError('Please provide resourceType, quantity, and location', 400);
  }

  const request = await resourceService.createResourceRequest({
    citizenId: req.user._id,
    resourceType,
    quantity,
    location,
    description,
    disasterReportId,
  });

  // Use the notification service to handle real-time and push notifications for volunteers
  await notificationService.notifyNewRequest(req.io, request);


  // Optional: Auto-assign closest volunteer
  let assignment = null;
  if (autoAssign) {
    try {
      assignment = await locationService.assignClosestVolunteer(request._id);
      
      // Notify the assigned volunteer via socket
      req.io.to(`user-${assignment.assignedVolunteer._id}`).emit('request_assigned_nearby', {
        requestId: request._id,
        distance: assignment.assignedVolunteer.distance,
        message: `You have been automatically assigned to a nearby ${request.resourceType} request.`
      });
    } catch (err) {
      console.log('Auto-assignment failed:', err.message);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Resource request created',
    data: request,
    assignment: assignment
  });
});

// Get all resource requests
export const getResourceRequests = asyncHandler(async (req, res) => {
  const { status, resourceType, urgency, citizenId } = req.query;

  const requests = await resourceService.getResourceRequests({
    status,
    resourceType,
    urgency,
    citizenId,
  });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// Get single resource request
export const getResourceRequestById = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await resourceService.getResourceRequestById(requestId);

  res.status(200).json({
    success: true,
    data: request,
  });
});

// Get nearby requests for volunteer
export const getNearbyRequests = asyncHandler(async (req, res) => {
  const { longitude, latitude, radius } = req.query;

  if (!longitude || !latitude) {
    throw new AppError('Please provide longitude and latitude', 400);
  }

  const requests = await resourceService.getNearbyRequests(
    [parseFloat(longitude), parseFloat(latitude)],
    parseFloat(radius) || 10
  );

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// Accept request (Volunteer)
export const acceptRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await resourceService.acceptRequest(requestId, req.user._id);

  res.status(200).json({
    success: true,
    message: 'Request accepted',
    data: request,
  });
});

// Update request status
export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    throw new AppError('Please provide status', 400);
  }

  const request = await resourceService.updateRequestStatus(requestId, status, notes);

  res.status(200).json({
    success: true,
    message: 'Request status updated',
    data: request,
  });
});

// Add progress update
export const addProgressUpdate = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { message, images } = req.body;

  if (!message) {
    throw new AppError('Please provide a message', 400);
  }

  const request = await resourceService.updateProgressUpdate(requestId, {
    message,
    images,
  });

  res.status(200).json({
    success: true,
    message: 'Progress updated',
    data: request,
  });
});

// Get my requests (Citizen)
export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await resourceService.getMyRequests(req.user._id);

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// Get my responses (Volunteer)
export const getMyResponses = asyncHandler(async (req, res) => {
  const responses = await resourceService.getMyResponses(req.user._id);

  res.status(200).json({
    success: true,
    count: responses.length,
    data: responses,
  });
});

// Complete request
export const completeRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { rating, feedback } = req.body;

  const request = await resourceService.completeRequest(requestId, req.user._id, {
    rating,
    feedback,
  });

  res.status(200).json({
    success: true,
    message: 'Request completed',
    data: request,
  });
});

// Assign priority (Admin)
export const assignPriority = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { priority } = req.body;

  if (!priority) {
    throw new AppError('Please provide priority', 400);
  }

  const request = await coordinationService.assignPriority(requestId, priority);

  res.status(200).json({
    success: true,
    message: 'Priority assigned',
    data: request,
  });
});

// Get coordination status (Admin)
export const getCoordinationStatus = asyncHandler(async (req, res) => {
  const status = await coordinationService.getCoordinationStatus();

  res.status(200).json({
    success: true,
    data: status,
  });
});

// Get high priority requests (Admin)
export const getHighPriorityRequests = asyncHandler(async (req, res) => {
  const requests = await coordinationService.getHighPriorityRequests();

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests,
  });
});

// Cancel request
export const cancelRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { reason } = req.body;

  const request = await coordinationService.cancelRequest(requestId, reason);

  res.status(200).json({
    success: true,
    message: 'Request cancelled',
    data: request,
  });
});

// Get pending requests count
export const getPendingRequestsCount = asyncHandler(async (req, res) => {
  const count = await resourceService.getPendingRequestsCount();

  res.status(200).json({
    success: true,
    count,
  });
});
