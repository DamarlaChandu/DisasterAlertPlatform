import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/errorHandler.js';

// Authentication & Access Control Service
class AuthenticationService {
  async register(userData) {
    const { name, email, password, role, phone, address, location } = userData;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      throw new AppError('User already exists with that email', 400);
    }

    // Validate role
    if (!['citizen', 'volunteer', 'admin'].includes(role)) {
      throw new AppError('Invalid role specified', 400);
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      role,
      phone,
      address,
      location: location || {
        type: 'Point',
        coordinates: [0, 0],
      },
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    return {
      user: user.toJSON(),
      token,
    };
  }

  async login(email, password) {
    // Validate email & password
    if (!email || !password) {
      throw new AppError('Please provide an email and password', 400);
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = generateToken(user._id, user.role);

    return {
      user: user.toJSON(),
      token,
    };
  }

  async verifyToken(token) {
    if (!token) {
      throw new AppError('No token provided', 400);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return user;
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
}

export default new AuthenticationService();
