import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { protect, citizenOnly, volunteerOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Create resource request (Citizen)
router.post('/', protect, citizenOnly, resourceController.createResourceRequest);

// Get all requests
router.get('/', protect, resourceController.getResourceRequests);

// Get nearby requests
router.get('/nearby', protect, resourceController.getNearbyRequests);

// Get pending count
router.get('/count/pending', protect, resourceController.getPendingRequestsCount);

// Get my requests (Citizen)
router.get('/my/requests', protect, citizenOnly, resourceController.getMyRequests);

// Get my responses (Volunteer)
router.get('/my/responses', protect, volunteerOnly, resourceController.getMyResponses);

// Get single request
router.get('/:requestId', protect, resourceController.getResourceRequestById);

// Accept request (Volunteer)
router.post('/:requestId/accept', protect, volunteerOnly, resourceController.acceptRequest);

// Update request status
router.put('/:requestId/status', protect, resourceController.updateRequestStatus);

// Add progress update
router.post('/:requestId/progress', protect, resourceController.addProgressUpdate);

// Complete request
router.post('/:requestId/complete', protect, volunteerOnly, resourceController.completeRequest);

// Assign priority (Admin)
router.put('/:requestId/priority', protect, adminOnly, resourceController.assignPriority);

// Cancel request
router.post('/:requestId/cancel', protect, resourceController.cancelRequest);

// Get coordination status (Admin)
router.get('/admin/status', protect, adminOnly, resourceController.getCoordinationStatus);

// Get high priority requests (Admin)
router.get('/admin/high-priority', protect, adminOnly, resourceController.getHighPriorityRequests);

export default router;
