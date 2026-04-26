import express from 'express';
import { protect } from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';
import { asyncHandler } from '../utils/errorHandler.js';

const router = express.Router();

// Save push subscription
router.post('/subscribe', protect, asyncHandler(async (req, res) => {
  const { subscription } = req.body;

  if (!subscription) {
    return res.status(400).json({ success: false, message: 'Subscription is required' });
  }

  await notificationService.saveSubscription(req.user._id, req.user.role, subscription);

  res.status(200).json({
    success: true,
    message: 'Push notification subscription saved successfully',
  });
}));

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  res.status(200).json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY,
  });
});

export default router;
