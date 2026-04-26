import express from 'express';
import * as locationController from '../controllers/locationController.js';
import { protect, adminOnly, volunteerOnly } from '../middleware/auth.js';
import { throttleLocationUpdate } from '../middleware/locationThrottler.js';

const router = express.Router();

// All location routes require authentication
router.use(protect);

// Update user's live location (for volunteers sharing location)
router.post('/update', throttleLocationUpdate, locationController.updateLocation);

// Get my current location (if sharing enabled)
router.get('/me', locationController.getMyLocation);

// Enable/disable location sharing
router.post('/sharing', locationController.setLocationSharing);

// Find nearby volunteers (citizen/admin can find volunteers)
router.get('/nearby-volunteers', locationController.getNearbyVolunteers);

// Find nearby disasters
router.get('/nearby-disasters', locationController.getNearbyDisasters);

// Find nearby requests
router.get('/nearby-requests', locationController.getNearbyRequests);

// Get activity heat map (for dashboard visualization)
router.get('/heatmap', locationController.getActivityHeatMap);

// Get location stats for a specific request
router.get('/request/:requestId/stats', locationController.getRequestLocationStats);

// Admin-only routes
router.get('/admin/volunteers', adminOnly, locationController.getActiveVolunteerLocations);
router.get('/admin/citizens', adminOnly, locationController.getActiveCitizenLocations);
router.get('/admin/disasters', adminOnly, locationController.getActiveDisasterLocations);

router.get('/admin/history/:userId', adminOnly, locationController.getUserLocationHistory);

export default router;
