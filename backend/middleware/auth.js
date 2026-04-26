import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/errorHandler.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = new AppError(
        `User role '${req.user.role}' is not authorized to access this route`,
        403
      );
      return next(error);
    }
    next();
  };
};

// Admin only
export const adminOnly = authorize('admin');

// Citizen only
export const citizenOnly = authorize('citizen', 'admin');

// Volunteer only
export const volunteerOnly = authorize('volunteer', 'admin');
