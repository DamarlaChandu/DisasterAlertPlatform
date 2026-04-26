import authService from '../services/authService.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

// Register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address, location } = req.body;

  if (!name || !email || !password || !role) {
    throw new AppError('Please provide name, email, password, and role', 400);
  }

  const result = await authService.register({
    name,
    email,
    password,
    role,
    phone,
    address,
    location,
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
});

// Get current user
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});
