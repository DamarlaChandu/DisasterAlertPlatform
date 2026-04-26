import User from '../models/User.js';
import { AppError } from '../utils/errorHandler.js';

// Profile & Role Management Service
class ProfileService {
  async getUserProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async updateProfile(userId, updateData) {
    const { name, phone, address, location, skills } = updateData;

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (location) {
      user.location = {
        type: 'Point',
        coordinates: location.coordinates || [0, 0],
      };
    }
    if (skills && user.role === 'volunteer') {
      user.skills = skills;
    }

    await user.save();
    return user;
  }

  async updateProfileImage(userId, imageUrl) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.profileImage = imageUrl;
    await user.save();

    return user;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check old password
    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      throw new AppError('Incorrect password', 400);
    }

    user.password = newPassword;
    await user.save();

    return { success: true, message: 'Password changed successfully' };
  }

  async getAllUsers(role = null) {
    let query = {};

    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password');
    return users;
  }

  async deactivateUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = false;
    await user.save();

    return { success: true, message: 'User deactivated' };
  }

  async activateUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isActive = true;
    await user.save();

    return { success: true, message: 'User activated' };
  }
}

export default new ProfileService();
