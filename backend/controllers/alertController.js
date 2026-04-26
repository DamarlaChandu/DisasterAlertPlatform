import alertService from '../services/alertService.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import notificationService from '../services/notificationService.js';


// Create disaster report
export const createDisasterReport = asyncHandler(async (req, res) => {
  const { disasterType, description, location, resourcesNeeded } = req.body;

  if (!disasterType || !description || !location) {
    throw new AppError('Please provide disasterType, description, and location', 400);
  }

  const report = await alertService.createDisasterReport({
    userId: req.user._id,
    disasterType,
    description,
    location,
    resourcesNeeded,
  });

  // Use the notification service to handle real-time and push notifications
  await notificationService.notifyNewDisaster(req.io, report);

  // Specifically notify admins via socket
  req.io.to('role-admin').emit('new_disaster', {
    reportId: report._id,
    disasterType: report.disasterType,
    severity: report.severity,
    location: report.location,
  });

  // Notify nearby volunteers (within 10km) via socket
  req.io.emit('incident:nearby', {
    incidentId: report._id,
    coordinates: report.location.coordinates,
    radius: 10,
    message: `A ${report.disasterType} has been reported near your location. Severity: ${report.severity}`,
  });


  res.status(201).json({
    success: true,
    message: 'Disaster report created and nearby users notified',
    data: report,
  });
});

// Get all disaster reports
export const getDisasterReports = asyncHandler(async (req, res) => {
  const { status, disasterType, severity, priority } = req.query;

  const reports = await alertService.getDisasterReports({
    status,
    disasterType,
    severity,
    priority,
  });

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports,
  });
});

// Get single disaster report
export const getDisasterReportById = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const report = await alertService.getDisasterReportById(reportId);

  res.status(200).json({
    success: true,
    data: report,
  });
});

// Update disaster report
export const updateDisasterReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const report = await alertService.updateDisasterReport(reportId, req.body);

  res.status(200).json({
    success: true,
    message: 'Report updated',
    data: report,
  });
});

// Get nearby disasters
export const getNearbyDisasters = asyncHandler(async (req, res) => {
  const { longitude, latitude, radius } = req.query;

  if (!longitude || !latitude) {
    throw new AppError('Please provide longitude and latitude', 400);
  }

  const reports = await alertService.getNearbyDisasters(
    [parseFloat(longitude), parseFloat(latitude)],
    parseFloat(radius) || 10
  );

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports,
  });
});

// Get active disasters count
export const getActiveDisastersCount = asyncHandler(async (req, res) => {
  const count = await alertService.getActiveDisastersCount();

  res.status(200).json({
    success: true,
    count,
  });
});

// Accept disaster as mission (Volunteer)
export const acceptDisasterMission = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  
  console.log(`Accepting disaster mission: ${reportId} for user: ${req.user._id}`);

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

// Delete disaster report
export const deleteDisasterReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const result = await alertService.deleteDisasterReport(reportId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});
