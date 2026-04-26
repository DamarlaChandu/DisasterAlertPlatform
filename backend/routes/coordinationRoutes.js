import express from 'express';
import * as coordinationController from '../controllers/coordinationController.js';
import { protect, adminOnly, volunteerOnly } from '../middleware/auth.js';

const router = express.Router();

// Accept disaster as mission (Volunteer)
router.post('/accept-mission/:reportId', protect, volunteerOnly, coordinationController.acceptDisasterMission);

// Add progress update
router.post('/:responseId/progress', protect, coordinationController.addProgressUpdate);

// Rate volunteer
router.post('/:responseId/rate', protect, coordinationController.rateVolunteer);

// Get volunteer stats
router.get('/volunteer/:volunteerId/stats', protect, coordinationController.getVolunteerStats);

// Get coordination status (Admin)
router.get('/admin/status', protect, adminOnly, coordinationController.getCoordinationStatus);

// Get high priority requests (Admin)
router.get('/admin/high-priority', protect, adminOnly, coordinationController.getHighPriorityRequests);

// Cancel request (Admin)
router.post('/:requestId/cancel', protect, adminOnly, coordinationController.cancelRequest);

export default router;
