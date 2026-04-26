import { AppError } from '../utils/errorHandler.js';

const lastUpdates = new Map();

/**
 * Middleware to throttle location updates
 * Prevents rapid spamming of location data
 * Default: 5 seconds for volunteers, 30 seconds for others
 */
export const throttleLocationUpdate = (req, res, next) => {
  const userId = req.user?._id?.toString();
  if (!userId) return next();

  const now = Date.now();
  const lastUpdate = lastUpdates.get(userId);
  
  // Volunteers can update faster (every 5s) during active tasks
  // Regular users throttled to 30s
  const waitTime = req.user.role === 'volunteer' ? 5000 : 30000;
  const gracePeriod = 500; // 0.5s grace period

  if (lastUpdate && (now - lastUpdate < (waitTime - gracePeriod))) {
    const remaining = Math.ceil((waitTime - (now - lastUpdate)) / 1000);
    return next(new AppError(`Too many updates. Please wait ${remaining}s.`, 429));
  }

  lastUpdates.set(userId, now);
  
  // Periodic cleanup of the map to prevent memory leaks
  if (lastUpdates.size > 1000) {
    const threshold = now - 60000; // Remove anything older than 1 minute
    for (const [id, time] of lastUpdates.entries()) {
      if (time < threshold) lastUpdates.delete(id);
    }
  }

  next();
};
