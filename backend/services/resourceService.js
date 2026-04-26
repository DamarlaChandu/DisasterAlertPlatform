import ResourceRequest from '../models/ResourceRequest.js';
import Response from '../models/Response.js';
import { AppError } from '../utils/errorHandler.js';
import { calculateDistance } from '../utils/helpers.js';

// Resource & Coordination Service
class ResourceService {
  async createResourceRequest(requestData) {
    const { citizenId, resourceType, quantity, location, description, disasterReportId } =
      requestData;

    const request = new ResourceRequest({
      citizenId,
      resourceType,
      quantity,
      location: {
        type: 'Point',
        coordinates: location.coordinates || [0, 0],
        address: location.address || '',
      },
      description,
      disasterReportId,
      status: 'pending',
    });

    await request.save();
    await request.populate('citizenId', 'name email phone');

    return request;
  }

  async getResourceRequests(filters = {}) {
    let query = {};

    if (filters.status) query.status = filters.status;
    if (filters.resourceType) query.resourceType = filters.resourceType;
    if (filters.urgency) query.urgency = filters.urgency;
    if (filters.citizenId) query.citizenId = filters.citizenId;

    const requests = await ResourceRequest.find(query)
      .populate('citizenId', 'name email phone address location')
      .populate('assignedVolunteer', 'name email phone')
      .sort({ urgency: -1, createdAt: -1 });

    return requests;
  }

  async getResourceRequestById(requestId) {
    const request = await ResourceRequest.findById(requestId)
      .populate('citizenId', 'name email phone address')
      .populate('assignedVolunteer', 'name email phone')
      .populate('volunteerResponse');

    if (!request) {
      throw new AppError('Resource request not found', 404);
    }

    return request;
  }

  async getNearbyRequests(volunteerCoordinates, radiusKm = 10) {
    const requests = await ResourceRequest.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: volunteerCoordinates,
          },
          $maxDistance: radiusKm * 1000,
        },
      },
      status: 'pending',
    })
      .populate('citizenId', 'name email phone address')
      .sort({ urgency: -1, priority: -1, createdAt: -1 });

    return requests;
  }

  async acceptRequest(requestId, volunteerId) {
    const request = await ResourceRequest.findById(requestId);

    if (!request) {
      throw new AppError('Resource request not found', 404);
    }

    if (request.status !== 'pending') {
      throw new AppError('Request is not available for acceptance', 400);
    }

    request.assignedVolunteer = volunteerId;
    request.status = 'accepted';
    request.acceptedAt = new Date();

    await request.save();

    // Create response record
    const response = new Response({
      requestId,
      volunteerId,
      status: 'accepted',
    });

    await response.save();
    request.volunteerResponse = response._id;
    await request.save();

    await request.populate('assignedVolunteer', 'name email phone');

    return request;
  }

  async updateRequestStatus(requestId, status, notes = null) {
    const request = await ResourceRequest.findById(requestId);

    if (!request) {
      throw new AppError('Resource request not found', 404);
    }

    const validStatuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    request.status = status;
    if (notes) request.notes = notes;

    // Update response status to keep them in sync
    if (request.volunteerResponse) {
      const response = await Response.findById(request.volunteerResponse);
      if (response) {
        response.status = status;
        if (status === 'completed') {
          response.completedAt = new Date();
        }
        await response.save();
      }
    }

    if (status === 'completed') {
      request.completedAt = new Date();
    }

    await request.save();
    return request;
  }

  async updateProgressUpdate(requestId, updateData) {
    const request = await ResourceRequest.findById(requestId);

    if (!request) {
      throw new AppError('Resource request not found', 404);
    }

    if (request.volunteerResponse) {
      const response = await Response.findById(request.volunteerResponse);

      if (response) {
        response.progressUpdates.push({
          timestamp: new Date(),
          message: updateData.message,
          images: updateData.images || [],
        });

        await response.save();
      }
    }

    return request;
  }

  async getMyRequests(citizenId) {
    const requests = await ResourceRequest.find({ citizenId })
      .populate('assignedVolunteer', 'name email phone')
      .sort({ createdAt: -1 });

    return requests;
  }

  async getMyResponses(volunteerId) {
    const responses = await Response.find({ volunteerId })
      .populate('requestId')
      .sort({ createdAt: -1 });

    return responses;
  }

  async completeRequest(requestId, volunteerId, feedbackData) {
    const request = await ResourceRequest.findById(requestId);

    if (!request) {
      throw new AppError('Resource request not found', 404);
    }

    if (request.assignedVolunteer.toString() !== volunteerId) {
      throw new AppError('You are not assigned to this request', 403);
    }

    request.status = 'completed';
    request.completedAt = new Date();

    if (request.volunteerResponse) {
      const response = await Response.findById(request.volunteerResponse);

      if (response) {
        response.status = 'completed';
        response.completedAt = new Date();
        if (feedbackData.rating) response.rating = feedbackData.rating;
        if (feedbackData.feedback) response.feedback = feedbackData.feedback;

        await response.save();
      }
    }

    await request.save();
    return request;
  }

  async getPendingRequestsCount() {
    const count = await ResourceRequest.countDocuments({ status: 'pending' });
    return count;
  }
}

export default new ResourceService();
