import express from 'express';
import * as alertController from '../controllers/alertController.js';
import { protect, citizenOnly, volunteerOnly, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Diagnostic test
router.get('/test-route', (req, res) => res.json({ message: 'Alert routes are working' }));

// Accept disaster as mission (Volunteer)
router.post('/volunteer/accept/:reportId', protect, volunteerOnly, alertController.acceptDisasterMission);

// Create disaster report (Citizen)
router.post('/', protect, citizenOnly, alertController.createDisasterReport);

// Get all reports
router.get('/', protect, alertController.getDisasterReports);

// Get nearby reports
router.get('/nearby', protect, alertController.getNearbyDisasters);

// Get active count
router.get('/count/active', protect, alertController.getActiveDisastersCount);

// Get single report
router.get('/:reportId', protect, alertController.getDisasterReportById);

// Update report (Admin/Owner)
router.put('/:reportId', protect, alertController.updateDisasterReport);

// Delete report (Admin/Owner)
router.delete('/:reportId', protect, alertController.deleteDisasterReport);

export default router;
