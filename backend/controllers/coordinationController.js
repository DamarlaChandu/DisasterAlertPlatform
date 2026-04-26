import coordinationService from '../services/coordinationService.js';
import alertService from '../services/alertService.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

// Accept disaster as mission (Volunteer)
export const acceptDisasterMission = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  
  console.log(`Accepting mission from coordination: ${reportId} for user: ${req.user._id}`);

  const report = await alertService.updateDisasterReport(reportId, {
    assignedVolunteer: req.user._id
  });

  if (!report) {
    throw new AppError('Disaster report not found or update failed', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Disaster mission accepted',
    data: report,
  });
});

// Add progress update to response
export const addProgressUpdate = asyncHandler(async (req, res) => {
  const { responseId } = req.params;
  const { message, images } = req.body;

  if (!message) {
    throw new AppError('Please provide a message', 400);
  }

  const response = await coordinationService.addProgressUpdate(responseId, {
    message,
    images,
  });

  res.status(200).json({
    success: true,
    message: 'Progress update added',
    data: response,
  });
});

// Rate volunteer
export const rateVolunteer = asyncHandler(async (req, res) => {
  const { responseId } = req.params;
  const { rating, feedback } = req.body;

  if (!rating) {
    throw new AppError('Please provide a rating', 400);
  }

  const response = await coordinationService.rateVolunteer(responseId, rating, feedback);

  res.status(200).json({
    success: true,
    message: 'Volunteer rated successfully',
    data: response,
  });
});

// Get volunteer stats
export const getVolunteerStats = asyncHandler(async (req, res) => {
  const { volunteerId } = req.params;

  const stats = await coordinationService.getVolunteerStats(volunteerId);

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// Get coordination status
export const getCoordinationStatus = asyncHandler(async (req, res) => {
  const status = await coordinationService.getCoordinationStatus();

  res.status(200).json({
    success: true,
    data: status,
  });
});

// Get high priority requests
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

  if (!reason) {
    throw new AppError('Please provide a reason for cancellation', 400);
  }

  const request = await coordinationService.cancelRequest(requestId, reason);

  res.status(200).json({
    success: true,
    message: 'Request cancelled',
    data: request,
  });
});
