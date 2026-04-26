import express from 'express';
import * as profileController from '../controllers/profileController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.get('/me', protect, profileController.getProfile);
router.put('/me', protect, profileController.updateProfile);
router.put('/image', protect, profileController.updateProfileImage);
router.put('/password', protect, profileController.changePassword);

// Admin routes
router.get('/users', protect, adminOnly, profileController.getAllUsers);
router.put('/deactivate/:userId', protect, adminOnly, profileController.deactivateUser);
router.put('/activate/:userId', protect, adminOnly, profileController.activateUser);

export default router;
