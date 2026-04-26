import Response from '../models/Response.js';
import ResourceRequest from '../models/ResourceRequest.js';
import { AppError } from '../utils/errorHandler.js';

// Coordination & Feedback Service
class CoordinationService {
  async addProgressUpdate(responseId, updateData) {
    const response = await Response.findById(responseId);

    if (!response) {
      throw new AppError('Response not found', 404);
    }

    response.progressUpdates.push({
      timestamp: new Date(),
      message: updateData.message,
      images: updateData.images || [],
    });

    await response.save();
    return response;
  }

  async rateVolunteer(responseId, rating, feedback) {
    const response = await Response.findById(responseId);

    if (!response) {
      throw new AppError('Response not found', 404);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    response.rating = rating;
    response.feedback = feedback;

    await response.save();
    return response;
  }

  async getVolunteerStats(volunteerId) {
    const totalAccepted = await Response.countDocuments({
      volunteerId,
      status: { $ne: 'cancelled' },
    });

    const completed = await Response.countDocuments({
      volunteerId,
      status: 'completed',
    });

    const inProgress = await Response.countDocuments({
      volunteerId,
      status: 'in_progress',
    });

    const responses = await Response.find({
      volunteerId,
      rating: { $exists: true, $ne: null },
    });

    const avgRating =
      responses.length > 0 ? responses.reduce((sum, r) => sum + r.rating, 0) / responses.length : 0;

    return {
      totalAccepted,
      completed,
      inProgress,
      avgRating: avgRating.toFixed(2),
      totalRatings: responses.length,
    };
  }

  async assignPriority(requestId, priority) {
    const request = await ResourceRequest.findById(requestId);

    if (!request) {
      throw new AppError('Request not found', 404);
    }

    const validPriorities = ['low', 'medium', 'high'];

    if (!validPriorities.includes(priority)) {
      throw new AppError('Invalid priority level', 400);
    }

    request.priority = priority;
    await request.save();

    return request;
  }

  async getCoordinationStatus() {
    const pending = await ResourceRequest.countDocuments({ status: 'pending' });
    const inProgress = await ResourceRequest.countDocuments({ status: 'in_progress' });
    const completed = await ResourceRequest.countDocuments({ status: 'completed' });
    const cancelled = await ResourceRequest.countDocuments({ status: 'cancelled' });

    return {
      pending,
      inProgress,
      completed,
      cancelled,
      total: pending + inProgress + completed + cancelled,
    };
  }

  async getHighPriorityRequests() {
    const requests = await ResourceRequest.find({ priority: 'high', status: { $ne: 'completed' } })
      .populate('citizenId', 'name email phone')
      .populate('assignedVolunteer', 'name email phone')
      .sort({ createdAt: -1 });

    return requests;
  }

  async cancelRequest(requestId, reason) {
    const request = await ResourceRequest.findById(requestId);

    if (!request) {
      throw new AppError('Request not found', 404);
    }

    request.status = 'cancelled';
    request.notes = reason;

    if (request.volunteerResponse) {
      const response = await Response.findById(request.volunteerResponse);

      if (response && response.status !== 'completed') {
        response.status = 'cancelled';
        await response.save();
      }
    }

    await request.save();
    return request;
  }
}

export default new CoordinationService();
