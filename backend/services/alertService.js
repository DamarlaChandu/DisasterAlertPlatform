import DisasterReport from '../models/DisasterReport.js';
import { AppError } from '../utils/errorHandler.js';
import { detectSeverity, extractKeywords } from '../utils/helpers.js';

// Alert & Reporting Service
class AlertService {
  async createDisasterReport(reportData) {
    const { userId, disasterType, description, location, resourcesNeeded } = reportData;

    // Auto-detect severity and keywords
    const severity = detectSeverity(description);
    const keywords = extractKeywords(description);

    const report = new DisasterReport({
      userId,
      disasterType,
      description,
      location: {
        type: 'Point',
        coordinates: location.coordinates || [0, 0],
        address: location.address || '',
      },
      severity,
      autoDetectedKeywords: keywords,
      resourcesNeeded: resourcesNeeded || [],
      status: 'active',
    });

    await report.save();
    await report.populate('userId', 'name email phone');

    return report;
  }

  async getDisasterReports(filters = {}) {
    let query = {};

    if (filters.status) query.status = filters.status;
    if (filters.disasterType) query.disasterType = filters.disasterType;
    if (filters.severity) query.severity = filters.severity;
    if (filters.priority) query.priority = filters.priority;
    if (filters.assignedVolunteer) query.assignedVolunteer = filters.assignedVolunteer;

    const reports = await DisasterReport.find(query)
      .populate('userId', 'name email phone address')
      .sort({ createdAt: -1 });

    return reports;
  }

  async getDisasterReportById(reportId) {
    const report = await DisasterReport.findById(reportId).populate(
      'userId',
      'name email phone address'
    );

    if (!report) {
      throw new AppError('Disaster report not found', 404);
    }

    return report;
  }

  async updateDisasterReport(reportId, updateData) {
    const { description, resourcesNeeded, status, priority, assignedVolunteer } = updateData;

    const report = await DisasterReport.findById(reportId);

    if (!report) {
      throw new AppError('Disaster report not found', 404);
    }

    if (description) {
      report.description = description;
      report.severity = detectSeverity(description);
      report.autoDetectedKeywords = extractKeywords(description);
    }

    if (resourcesNeeded) report.resourcesNeeded = resourcesNeeded;
    if (status) report.status = status;
    if (priority) report.priority = priority;
    if (assignedVolunteer) report.assignedVolunteer = assignedVolunteer;

    if (status === 'resolved' || status === 'closed') {
      report.resolvedAt = new Date();
    }

    await report.save();
    return report;
  }

  async getNearbyDisasters(coordinates, radiusKm = 10) {
    const reports = await DisasterReport.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
          $maxDistance: radiusKm * 1000,
        },
      },
      status: 'active',
    })
      .populate('userId', 'name email phone')
      .sort({ severity: -1, createdAt: -1 });

    return reports;
  }

  async getActiveDisastersCount() {
    const count = await DisasterReport.countDocuments({ status: 'active' });
    return count;
  }

  async deleteDisasterReport(reportId) {
    const report = await DisasterReport.findByIdAndDelete(reportId);

    if (!report) {
      throw new AppError('Disaster report not found', 404);
    }

    return { success: true, message: 'Report deleted' };
  }
}

export default new AlertService();
