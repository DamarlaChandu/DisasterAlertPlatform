import profileService from '../services/profileService.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

// Get user profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await profileService.getUserProfile(req.user._id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Update profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await profileService.updateProfile(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});

// Update profile image
export const updateProfileImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    throw new AppError('Image URL is required', 400);
  }

  const user = await profileService.updateProfileImage(req.user._id, imageUrl);

  res.status(200).json({
    success: true,
    message: 'Profile image updated',
    data: user,
  });
});

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new AppError('Please provide old and new password', 400);
  }

  const result = await profileService.changePassword(req.user._id, oldPassword, newPassword);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// Get all users (Admin)
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;

  const users = await profileService.getAllUsers(role);

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// Deactivate user
export const deactivateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await profileService.deactivateUser(userId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// Activate user
export const activateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await profileService.activateUser(userId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});
